import { Publisher, Subjects, OrderCreatedEvent } from '@weworkbetter/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
