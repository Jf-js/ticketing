import { OrderCancelledEvent, OrderStatus } from '@weworkbetter/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';
import mongoose from 'mongoose';
import { Ticket } from '../../../../../tickets/src/models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create a listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // create an Order
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'na',
    status: OrderStatus.Created,
    price: 10,
  });
  await order.save();

  // create a fake event data
  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    ticket: {
      id: 'na',
    },
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it('Cancels an order', async () => {
  const { listener, order, data, msg } = await setup();
  // invoke the listener onMessage
  await listener.onMessage(data, msg);
  // set the expectations
  const cancelledOrder = await Order.findById(data.id);
  expect(cancelledOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, order, data, msg } = await setup();
  // invoke the listener onMessage
  await listener.onMessage(data, msg);
  // set the expectations
  expect(msg.ack).toHaveBeenCalled();
});
