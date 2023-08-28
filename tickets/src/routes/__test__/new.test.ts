import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for the post request', async () => {
  const response = await request(app).post('/api/tickets').send({});
  expect(response.status).not.toEqual(404);
});

it('Can only be accesed if the user is signed-in', async () => {
  await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns staus of other than 401 if the user is signed-in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});
  console.log(response.status);
  expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      price: 20,
    })
    .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test',
      price: -20,
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test',
    })
    .expect(400);
});

it('creates a ticket with valid inputs', async () => {
  // add in a check to make sure a ticket has been saved into the database.
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  // This test should be true or the length should be zero since
  // we delete every record after each test as per the below statement
  // in the file setup.ts

  // beforeEach(async () => {
  //   const collections = await mongoose.connection.db.collections();

  //   for (let collection of collections) {
  //     await collection.deleteMany();
  //   }
  // });

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test',
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual('20');
  expect(tickets[0].title).toEqual('test');
});

it('publishes an event', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'test',
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
