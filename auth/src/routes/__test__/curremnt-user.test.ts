import request from 'supertest';
import { app } from '../../app';

it('Current user returned', async () => {
  const cookie = await signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send() // it works even without this
    .expect(400);

  expect(response.body.currentUser.email).toEqual('a@a.com');
});

it('Current user return null if not signed-in', async () => {
  //  const cookie = await signin();

  const response = await request(app)
    .get('/api/users/currentuser')
    .send() // it works even without this
    .expect(200);

  expect(response.body.currentUser).toBeNull();
});
