import request from 'supertest';
import { app } from '../../app';

// The list of tests
//  1. Test if the cookie has been cleared

it('Cookie has been cleared', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'a@a.com',
      password: '1111',
    })
    .expect(201);

  const res = await request(app).post('/api/users/signout');
  expect(res.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
