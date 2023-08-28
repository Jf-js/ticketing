import Stripe from 'stripe';

// export const stripe = new Stripe(process.env.STRIPE_KEY!, {
//   apiVersion: '2023-08-16',
// });

export const stripe = require('stripe')(process.env.STRIPE_KEY!);
