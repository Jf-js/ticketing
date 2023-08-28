import { Publisher, Subjects, OrderCancelledEvent } from '@weworkbetter/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
