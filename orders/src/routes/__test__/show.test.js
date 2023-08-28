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
it('fetches the order', () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a ticket
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'ticket 1',
        price: 10,
    });
    yield ticket.save();
    // Build an order
    const user = global.signin();
    const { body: order } = yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    // fetch the order
    const { body: fetchedOrder } = yield (0, supertest_1.default)(app_1.app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);
    expect(order.id).toEqual(fetchedOrder.id);
}));
it('fetches the order by another user, returns 401 Not Found', () => __awaiter(void 0, void 0, void 0, function* () {
    // Create a ticket
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'ticket 1',
        price: 10,
    });
    yield ticket.save();
    // Build an order
    const user = global.signin();
    const { body: order } = yield (0, supertest_1.default)(app_1.app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);
    // fetching the order by another user
    const { body: fetchedOrder } = yield (0, supertest_1.default)(app_1.app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
}));
