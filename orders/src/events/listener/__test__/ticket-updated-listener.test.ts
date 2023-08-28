import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketUpdatedEvent } from '@weworkbetter/common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // Create an instance of a listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Creates and saves a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket test-1',
    price: 100,
  });
  await ticket.save();

  // Create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Ticket test-1 price changed',
    price: 150,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('finds, updates and saves a Ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with the data object and the message object
  await listener.onMessage(data, msg);

  // write assertions to make sure that a ticket was created!
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data!.price);
  expect(updatedTicket!.version).toEqual(data!.version);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object and the message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('it does not call ack function if the event has a skipped version', async () => {
  const { listener, data, msg, ticket } = await setup();

  // set in incorrect version number
  data.version = data.version + 10;

  // this try catch block is just to keep the control flow to the end
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
