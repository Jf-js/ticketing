import request from 'supertest';
import { app } from '../../app';

// 'return 201 on successful signin
// 'Invalid credentials' 2X
// case 1: User does not exist
// case 2: Password does not match

//Not done
// 'Email must be valid'
// 'You must supply a password'

it('returns 201 on successful signin', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@a.com',
      password: '1111',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'a@a.com',
      password: '1111',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});

it('User does not exists: Invalid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@a.com',
      password: '1111',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'x@a.com',
      password: '1111',
    })
    .expect(400);
});

it('Password does not match: Inavalid credentials', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@a.com',
      password: '1111',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'a@a.com',
      password: '1xxx',
    })
    .expect(400);
});
