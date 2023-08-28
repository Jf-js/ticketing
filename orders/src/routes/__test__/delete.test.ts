import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket 1',
    price: 10,
  });
  await ticket.save();

  // Create an order
  const jwt = global.signin();
  const { body: orderNew } = await request(app)
    .post('/api/orders')
    .set('Cookie', jwt)
    .send({ ticketId: ticket.id })
    .expect(201);

  // // cancel the order
  await request(app)
    .delete(`/api/orders/${orderNew.id}`)
    .set('Cookie', jwt)
    .send()
    .expect(204);

  const orderDeleted = await Order.findById(orderNew.id);
  //set the expectation
  expect(orderDeleted?.status).toEqual(OrderStatus.Cancelled);
});

it('While deleting, there should be an event emited', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket 1',
    price: 10,
  });
  await ticket.save();

  // Create an order
  const jwt = global.signin();
  const { body: orderNew } = await request(app)
    .post('/api/orders')
    .set('Cookie', jwt)
    .send({ ticketId: ticket.id })
    .expect(201);

  // // cancel the order
  await request(app)
    .delete(`/api/orders/${orderNew.id}`)
    .set('Cookie', jwt)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
