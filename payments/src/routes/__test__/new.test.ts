import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import mongoose from 'mongoose';
import { OrderStatus } from '@weworkbetter/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

const setup = async () => {
  // create an order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'testUser',
    status: OrderStatus.Created,
    price: 10,
  });
  await order.save();
  return { order };
};

it('Payment is strictly against an existing order, expects NotFound error 404 otherwise', async () => {
  const { order } = await setup();
  // request for payment
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'xx',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });

  expect(response.status).toEqual(404);
});

it('Unathorised payment is forbidden', async () => {
  const { order } = await setup();
  // request for payment
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'duplicate',
      orderId: order.id,
    });
  expect(response.status).toEqual(401);
});

it('Payment against a cancelled order is forbidden', async () => {
  const { order } = await setup();
  order.set({
    status: OrderStatus.Cancelled,
  });
  await order.save();
  // requst for payment with the user Id fixed in the order
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin('testUser'))
    .send({
      token: 'duplicate',
      orderId: order.id,
    });
  expect(response.status).toEqual(400);
});

it('returns a 201 with valid inputs', async () => {
  const { order } = await setup();
  // random price
  const price = Math.floor(Math.random() * 100000);
  order.set({
    status: OrderStatus.Created,
    price,
  });
  await order.save();
  // requst for payment with the user Id fixed in the order
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin('testUser'))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  // test with mocked function
  // const chargeOptions: {
  //   amount: number;
  //   currency: string;
  //   payment_method_types: string[];
  // } = stripe.paymentIntents.create.mock.calls[0][0];

  // expect(chargeOptions.amount).toEqual(10 * 100);
  // expect(chargeOptions.currency).toEqual('usd');
  // expect(chargeOptions.payment_method_types[0]).toEqual('card');

  // test with the real Stripe API
  const paymentIntents = await stripe.paymentIntents.list({
    limit: 3,
  });

  // @ts-ignore
  const testPaymentIntent = paymentIntents.data.find(
    (pi: { amount: number }) => pi.amount === price * 100
  );
  expect(testPaymentIntent).toBeDefined();
  expect(testPaymentIntent.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: testPaymentIntent.id,
  });

  expect(payment).not.toBeNull();
});
