import { subscribe } from 'diagnostics_channel';

export enum Subjects {
  TicketCreated = 'ticket:created',
  OrderCreated = 'order:created',
}
