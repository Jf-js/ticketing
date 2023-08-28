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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const order_1 = require("../../models/order");
const ticket_1 = require("../../models/ticket");
const nats_wrapper_1 = require("../../nats-wrapper");
const mongoose_1 = __importDefault(require("mongoose"));
it('marks an order as cancelled', () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a ticket
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'Ticket 1',
        price: 10,
    });
    yield ticket.save();
    // Create an order
    const jwt = global.signin();
    const { body: orderNew } = yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', jwt)
        .send({ ticketId: ticket.id })
        .expect(201);
    // // cancel the order
    yield (0, supertest_1.default)(app_1.app)
        .delete(`/api/orders/${orderNew.id}`)
        .set('Cookie', jwt)
        .send()
        .expect(204);
    const orderDeleted = yield order_1.Order.findById(orderNew.id);
    //set the expectation
    expect(orderDeleted === null || orderDeleted === void 0 ? void 0 : orderDeleted.status).toEqual(order_1.OrderStatus.Cancelled);
}));
it('While deleting, there should be an event emited', () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a ticket
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'Ticket 1',
        price: 10,
    });
    yield ticket.save();
    // Create an order
    const jwt = global.signin();
    const { body: orderNew } = yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', jwt)
        .send({ ticketId: ticket.id })
        .expect(201);
    // // cancel the order
    yield (0, supertest_1.default)(app_1.app)
        .delete(`/api/orders/${orderNew.id}`)
        .set('Cookie', jwt)
        .send()
        .expect(204);
    expect(nats_wrapper_1.natsWrapper.client.publish).toHaveBeenCalled();
}));
