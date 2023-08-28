import { Publisher, Subjects, TicketCreatedEvent } from '@weworkbetter/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
