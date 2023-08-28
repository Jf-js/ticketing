import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticketCreatedPublisher';

console.clear();

// stan or client - stan is the community convetion
const stan = nats.connect('ticketing', 'abc', {
  url: 'http://localhost:4222',
});

stan.on('connect', async () => {
  console.log('Connected to the NATS');

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({ id: '1234', title: 'Title x', price: 10 });
  } catch (err) {
    console.error(err);
  }
  // const data = JSON.stringify({
  //   id: '1234',
  //   title: 'Title x',
  //   price: 10,
  // });

  // stan.publish('ticket:created', data, () => {
  //   console.log('Event published');
  // });
});
