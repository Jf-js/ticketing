import express, { Request, Response } from 'express';
import {
  NotAuthorizedError,
  NotFoundError,
  currentUser,
  requireAuth,
  OrderStatus,
} from '@weworkbetter/common';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    //    console.log('order found', order);
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    //    console.log('order found', order);
    await order.save();
    //    console.log('order found', order);

    // publishing the event - Order cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send({}); // 204 means data deleted
  }
);

export { router as deleteOrderRouter };
