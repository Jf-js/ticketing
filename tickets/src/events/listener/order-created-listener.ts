import { Listener, OrderCreatedEvent, Subjects } from '@weworkbetter/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find the ticket being reserved
    const ticket = await Ticket.findById(data.ticket.id);
    // throw an error if not found
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    // set the orderId
    ticket.set({ orderId: data.id });
    // save updates ticket
    await ticket.save();
    // publish this event
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });
    // ack the message
    msg.ack();
  }
}
