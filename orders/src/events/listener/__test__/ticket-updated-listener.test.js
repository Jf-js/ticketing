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
const ticket_updated_listener_1 = require("../ticket-updated-listener");
const nats_wrapper_1 = require("../../../nats-wrapper");
const ticket_1 = require("../../../models/ticket");
const setup = () => __awaiter(void 0, void 0, void 0, function* () {
    // Create an instance of a listener
    const listener = new ticket_updated_listener_1.TicketUpdatedListener(nats_wrapper_1.natsWrapper.client);
    // Creates and saves a ticket
    const ticket = ticket_1.Ticket.build({
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        title: 'Ticket test-1',
        price: 100,
    });
    yield ticket.save();
    // Create a fake data object
    const data = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'Ticket test-1 price changed',
        price: 150,
        userId: new mongoose_1.default.Types.ObjectId().toHexString(),
    };
    // Create a fake message object
    // @ts-ignore
    const msg = {
        ack: jest.fn(),
    };
    return { listener, data, msg, ticket };
});
it('finds, updates and saves a Ticket', () => __awaiter(void 0, void 0, void 0, function* () {
    const { listener, data, msg, ticket } = yield setup();
    // call the onMessage function with the data object and the message object
    yield listener.onMessage(data, msg);
    // write assertions to make sure that a ticket was created!
    const updatedTicket = yield ticket_1.Ticket.findById(data.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket.title).toEqual(data.title);
    expect(updatedTicket === null || updatedTicket === void 0 ? void 0 : updatedTicket.price).toEqual(data.price);
    expect(updatedTicket.version).toEqual(data.version);
}));
it('acks the message', () => __awaiter(void 0, void 0, void 0, function* () {
    const { listener, data, msg } = yield setup();
    // call the onMessage function with the data object and the message object
    yield listener.onMessage(data, msg);
    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
}));
it('it does not call ack function if the event has a skipped version', () => __awaiter(void 0, void 0, void 0, function* () {
    const { listener, data, msg, ticket } = yield setup();
    // set in incorrect version number
    data.version = data.version + 10;
    // this try catch block is just to keep the control flow to the end
    try {
        yield listener.onMessage(data, msg);
    }
    catch (err) { }
    expect(msg.ack).not.toHaveBeenCalled();
}));
