import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@weworkbetter/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
