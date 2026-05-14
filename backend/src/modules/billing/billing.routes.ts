import { FastifyInstance } from 'fastify';
import { billingService } from './billing.service';
import { subscribeSchema } from '../../shared/schemas';
import { sendSuccess } from '../../shared/response';
import Stripe from 'stripe';
import { config } from '../../config/env';

export async function billingRoutes(fastify: FastifyInstance) {
  /** POST /billing/subscribe - Create Razorpay order */
  fastify.post('/subscribe', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const order = await billingService.createRazorpayOrder(request.userId);
    return sendSuccess(reply, order);
  });

  /** POST /billing/subscribe-intl - Start Stripe checkout */
  fastify.post('/subscribe-intl', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = subscribeSchema.parse(request.body);
    const result = await billingService.createCheckoutSession(request.userId, body);
    return sendSuccess(reply, result);
  });

  /** POST /billing/sync-offline - Get manifest for PWA */
  fastify.post('/sync-offline', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const manifest = await billingService.getOfflineManifest(request.userId);
    return sendSuccess(reply, manifest);
  });

  /** POST /webhooks/razorpay - Handle payment success */
  fastify.post('/webhooks/razorpay', async (request, reply) => {
    const signature = request.headers['x-razorpay-signature'] as string;
    await billingService.verifyRazorpayPayment(request.body, signature);
    return reply.status(200).send({ status: 'ok' });
  });

  /** DELETE /billing/cancel - Cancel subscription */
  fastify.delete('/cancel', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const result = await billingService.cancelSubscription(request.userId);
    return sendSuccess(reply, result);
  });

  /** GET /billing/status - Get subscription status */
  fastify.get('/status', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const result = await billingService.getSubscriptionStatus(request.userId);
    return sendSuccess(reply, result);
  });

  /** POST /webhooks/stripe - Stripe webhook handler */
  fastify.post('/webhooks/stripe', {
    config: {
      rawBody: true,
    },
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;

    if (!sig || !config.stripe.webhookSecret) {
      return reply.status(400).send({ error: 'Missing signature' });
    }

    try {
      const stripe = new Stripe(config.stripe.secretKey!, {
        apiVersion: '2024-12-18.acacia',
      });
      const event = stripe.webhooks.constructEvent(
        request.rawBody as Buffer,
        sig,
        config.stripe.webhookSecret
      );

      await billingService.handleWebhook(event);

      return reply.status(200).send({ received: true });
    } catch (err) {
      return reply.status(400).send({ error: 'Webhook verification failed' });
    }
  });
}
