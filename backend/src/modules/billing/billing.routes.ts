import { FastifyInstance } from 'fastify';
import { billingService } from './billing.service';
import { subscribeSchema } from '../../shared/schemas';
import { sendSuccess } from '../../shared/response';
import Stripe from 'stripe';
import { config } from '../../config/env';

export async function billingRoutes(fastify: FastifyInstance) {
  /** POST /billing/subscribe - Start checkout */
  fastify.post('/subscribe', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const body = subscribeSchema.parse(request.body);
    const result = await billingService.createCheckoutSession(request.userId, body);
    return sendSuccess(reply, result);
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
