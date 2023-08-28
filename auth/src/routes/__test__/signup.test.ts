// supertest will allow us to fake
// a request against the express application
import request from 'supertest';
import { app } from '../../app';

// writing a test statement
// to send in a post request
// with a valid email and password
// and in response we get a status of 201
it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup') // this is the route
    .send({
      // this is the body of the request
      email: 'a@a.com',
      password: '1111',
    })
    .expect(201); // this is the assertion we do on the return value
});

it('returns a 400 with an invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@',
      password: '11111111',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@a.com',
      password: '11',
    })
    .expect(400);
});

// writing two separate tests inside of one handler,
// then async await syntax will help for that.
it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@a.com',
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: '1111',
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'b@b.com',
      password: '1111',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'b@b.com',
      password: '1111',
    })
    .expect(400);
});

// The response object returned is just like the res object in a middleware
it('it sets a cookie after successfull signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'b@b.com',
      password: '1111',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
