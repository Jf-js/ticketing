"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newOrderRouter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const common_1 = require("@weworkbetter/common");
const express_validator_1 = require("express-validator");
const ticket_1 = require("../models/ticket");
const order_1 = require("../models/order");
const order_cancelled_publisher_1 = require("../events/publishers/order-cancelled-publisher");
const nats_wrapper_1 = require("../nats-wrapper");
const EXPIRATION_WINDOW_SECONDS = 1 * 60;
const router = express_1.default.Router();
exports.newOrderRouter = router;
router.post('/api/orders', common_1.currentUser, common_1.requireAuth, [
    (0, express_validator_1.body)('ticketId')
        .notEmpty()
        .withMessage('TicketId must be provided')
        .custom((input) => mongoose_1.default.Types.ObjectId.isValid(input)),
], common_1.validateRequest, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.body;
    // Find the ticket in the databse
    const ticket = yield ticket_1.Ticket.findById(ticketId);
    if (!ticket) {
        throw new common_1.NotFoundError();
    }
    const isReserved = yield ticket.isReserved();
    // Check if the ticket has not already been reserved
    if (isReserved) {
        throw new common_1.BadRequestError('Ticket is already reserved');
    }
    // Set the expiration time
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    // Build the Order and save it
    const order = order_1.Order.build({
        userId: req.currentUser.id,
        status: common_1.OrderStatus.Created,
        expiresAt: expiration,
        ticket,
    });
    yield order.save();
    // Publish the event - An Order has been created.
    new order_cancelled_publisher_1.OrderCreatedPublisher(nats_wrapper_1.natsWrapper.client).publish({
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
}));
