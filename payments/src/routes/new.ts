import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  currentUser,
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@weworkbetter/common';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publisher/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();
router.post(
  '/api/payments',
  currentUser,
  requireAuth,
  [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError(
        'Payment against a cancelled order is forbidden'
      );
    }

    //const stripe = require('stripe')('sk_test_51NgLVlSJ7QhvPGP0LjT62MeGuKZLIRkil3knWB5X1xzfJViuz61D9Hj992fS8omncb3myjcVGcKtnZgEyXqN1Yin00haBPmKE1');

    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: '4242424242424242',
    //     exp_month: 12,
    //     exp_year: 2034,
    //     cvc: '314',
    //   },
    // });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.price * 100,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    //const stripe = require('stripe')('sk_test_51NgLVlSJ7QhvPGP0LjT62MeGuKZLIRkil3knWB5X1xzfJViuz61D9Hj992fS8omncb3myjcVGcKtnZgEyXqN1Yin00haBPmKE1');

    // const paymentIntent = await stripe.paymentIntents.update(
    //   'pi_1GszwY2eZvKYlo2CohCEmT6b',
    //   {metadata: {order_id: '6735'}}
    // );

    const payment = Payment.build({
      orderId,
      stripeId: paymentIntent.id,
      version: 0,
    });
    await payment.save();
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
      version: payment.version,
    });
    res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
