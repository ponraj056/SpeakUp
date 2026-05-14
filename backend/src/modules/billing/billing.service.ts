import Razorpay from 'razorpay';
import Stripe from 'stripe';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../shared/utils/errors';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId || 'rzp_test_dummy',
  key_secret: config.razorpay.keySecret || 'dummy_secret',
});

const stripe = new Stripe(config.stripe.secretKey || 'sk_test_dummy', {
  apiVersion: '2024-12-18.acacia' as any,
});

export class BillingService {
  /**
   * Create a Razorpay subscription (monthly: 19900, annual: 99900).
   */
  async createSubscription(userId: string, plan: 'MONTHLY' | 'ANNUAL') {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    const amount = plan === 'MONTHLY' ? 19900 : 99900;
    const planId = plan === 'MONTHLY' ? config.razorpay.monthlyPlanId : config.razorpay.annualPlanId;

    if (!planId) throw AppError.internal('Razorpay Plan IDs not configured');

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: plan === 'MONTHLY' ? 12 : 5, // Just for the contract
      quantity: 1,
      customer_notify: 1,
    });

    return {
      subscription_id: subscription.id,
      payment_link: subscription.short_url,
    };
  }

  /**
   * Handle Razorpay Webhook.
   */
  async handleRazorpayWebhook(signature: string, payload: any) {
    // Verify signature
    const secret = config.RAZORPAY_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw AppError.forbidden('Invalid webhook signature');
    }

    const event = payload.event;
    const data = payload.payload.subscription?.entity || payload.payload.payment?.entity;

    switch (event) {
      case 'subscription.activated':
      case 'subscription.charged':
        await this.activateSubscription(data.id, data.customer_id);
        break;
      case 'subscription.halted':
        await this.handleFailedPayment(data.id);
        break;
      case 'subscription.cancelled':
        await this.deactivateSubscription(data.id);
        break;
    }
  }

  private async activateSubscription(razorpaySubId: string, customerId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: razorpaySubId },
    });

    if (!sub) return;

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'ACTIVE',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Approximate
        },
      }),
      prisma.user.update({
        where: { id: sub.userId },
        data: {
          plan: 'PAID',
          planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          razorpayCustomerId: customerId,
        },
      }),
    ]);
  }

  private async handleFailedPayment(razorpaySubId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: razorpaySubId },
    });
    if (!sub) return;

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'PAST_DUE' },
    });
    // Trigger dunning email via BullMQ (to be implemented)
  }

  private async deactivateSubscription(razorpaySubId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId: razorpaySubId },
    });
    if (!sub) return;

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'CANCELLED' },
      }),
      prisma.user.update({
        where: { id: sub.userId },
        data: { plan: 'FREE' },
      }),
    ]);
  }
}
