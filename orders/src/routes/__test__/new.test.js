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
const mongoose_1 = __importDefault(require("mongoose"));
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const ticket_1 = require("../../models/ticket");
const order_1 = require("../../models/order");
const nats_wrapper_1 = require("../../nats-wrapper");
it('Invalid Ticket testing', () => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = new mongoose_1.default.Types.ObjectId();
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId })
        .expect(404);
}));
it('Reserved Ticket testing', () => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'Ticket 1',
        price: 10,
    });
    yield ticket.save();
    const order = order_1.Order.build({
        userId: 'someUserId',
        status: order_1.OrderStatus.Created,
        expiresAt: new Date(),
        ticket,
    });
    yield order.save();
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(400);
}));
it('Valid Ticket testing', () => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'Ticket 1',
        price: 10,
    });
    yield ticket.save();
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
}));
it('emits an event when an Order is created', () => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'Ticket 1',
        price: 10,
    });
    yield ticket.save();
    yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({ ticketId: ticket.id })
        .expect(201);
    expect(nats_wrapper_1.natsWrapper.client.publish).toHaveBeenCalled();
}));
