import { PaymentCreatedEvent, Publisher, Subjects } from '@weworkbetter/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
