import { Publisher, Subjects, TicketUpdatedEvent } from '@weworkbetter/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
