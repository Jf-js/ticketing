import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { NotFoundError, errorHandler } from '@weworkbetter/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes';
import { updateTicketRouter } from './routes/update';

const app = express();
// This is a setting related to the cookie part.
// very specifically with respect to the https security improvement.
// The reason for this that, traffic is now being proxied through
// ingress-nginx in the k8s cluster. Express is going to see that this
// request is proxied, and seeing this proxy, express will not trust this
// incoming https connection. The below setting make it explicit to
// Express that please trust the proxy.
app.set('trust proxy', true);

app.use(json());
app.use(
  cookieSession({
    // The cookies are not encrypted,
    // as this is not a need for a
    // non protected data encoded in a JWT
    signed: false,
    // The cookies are enabled only if the connection is over an https protocol,
    // this is just a security improvement.
    secure: process.env.NODE_ENV !== 'test',
  })
);

//app.use(currentUser);
app.use(indexTicketRouter);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);
console.log('url printing below 1');
app.all('*', async (req, res, next) => {
  console.log('url printing below 2');
  console.log(req.url);
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
