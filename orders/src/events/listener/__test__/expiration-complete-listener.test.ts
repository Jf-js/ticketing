import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Order, OrderStatus } from '../../../models/order';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent } from '@weworkbetter/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket 1',
    price: 10,
  });
  await ticket.save();

  const order = Order.build({
    userId: 'someone1',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, order, data, msg };
};

it('update the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('emit an Order cancelled event', async () => {
  const { listener, order, data, msg } = await setup();
  await listener.onMessage(data, msg);

  // Testing the function has been called
  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // checking whether it has been called with this order id
  const eventdata = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventdata.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  //Testing ack had been invoked
  expect(msg.ack).toHaveBeenCalled();
});
