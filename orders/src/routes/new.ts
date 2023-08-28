import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  BadRequestError,
  currentUser,
  OrderStatus,
} from '@weworkbetter/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

const router = express.Router();

router.post(
  '/api/orders',
  currentUser,
  requireAuth,
  [
    body('ticketId')
      .notEmpty()
      .withMessage('TicketId must be provided')
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    // Find the ticket in the databse
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    // Check if the ticket has not already been reserved
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Set the expiration time
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the Order and save it
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();

    // Publish the event - An Order has been created.
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      userId: order.userId,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        price: order.ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
