import Stripe from 'stripe';
import { prisma } from '../../config/database';
import { config } from '../../config/env';
import { AppError } from '../../shared/errors';
import { SubscribeInput } from '../../shared/schemas';

export class BillingService {
  private stripe: Stripe | null = null;

  private getStripe(): Stripe {
    if (!this.stripe) {
      if (!config.stripe.secretKey) {
        throw AppError.internal('Stripe not configured');
      }
      this.stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2024-12-18.acacia',
      });
    }
    return this.stripe;
  }

  /**
   * Create a Stripe checkout session for Pro subscription.
   */
  async createCheckoutSession(userId: string, input: SubscribeInput) {
    const stripe = this.getStripe();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });

    if (!user) throw AppError.notFound('User not found');

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = input.plan === 'PRO_MONTHLY'
      ? config.stripe.proMonthlyPriceId
      : config.stripe.proAnnualPriceId;

    if (!priceId) {
      throw AppError.internal('Stripe price ID not configured');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${config.server.frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.server.frontendUrl}/billing/cancel`,
      metadata: { userId, plan: input.plan },
    });

    return { sessionId: session.id, url: session.url };
  }

  /**
   * Cancel subscription.
   */
  async cancelSubscription(userId: string) {
    const stripe = this.getStripe();

    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!subscription) {
      throw AppError.notFound('No active subscription found');
    }

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelledAt: new Date() },
    });

    return { message: 'Subscription will be cancelled at end of billing period' };
  }

  /**
   * Handle Stripe webhook events.
   */
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) break;

        const subscriptionId = session.subscription as string;
        const stripeSubscription = await this.getStripe().subscriptions.retrieve(subscriptionId);

        await prisma.subscription.create({
          data: {
            userId,
            stripeSubscriptionId: subscriptionId,
            plan: session.metadata?.plan === 'PRO_ANNUAL' ? 'PRO_ANNUAL' : 'PRO_MONTHLY',
            status: 'ACTIVE',
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          },
        });

        // Upgrade user to Pro
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'PRO',
            planExpiresAt: new Date(stripeSubscription.current_period_end * 1000),
          },
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (subscription) {
          const stripeSubscription = await this.getStripe().subscriptions.retrieve(subscriptionId);
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: 'ACTIVE',
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: subscription.userId },
            data: {
              plan: 'PRO',
              planExpiresAt: new Date(stripeSubscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const subscription = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'CANCELLED', cancelledAt: new Date() },
          });

          await prisma.user.update({
            where: { id: subscription.userId },
            data: { plan: 'FREE', planExpiresAt: null },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: 'PAST_DUE' },
        });
        break;
      }
    }
  }

  /**
   * Get subscription status.
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    });

    return {
      plan: user?.plan || 'FREE',
      subscription: subscription
        ? {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelledAt: subscription.cancelledAt,
          }
        : null,
    };
  }
}

export const billingService = new BillingService();
