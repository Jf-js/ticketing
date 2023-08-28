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
exports.deleteOrderRouter = void 0;
const express_1 = __importDefault(require("express"));
const common_1 = require("@weworkbetter/common");
const order_1 = require("../models/order");
const order_created_publisher_1 = require("../events/publishers/order-created-publisher");
const nats_wrapper_1 = require("../nats-wrapper");
const router = express_1.default.Router();
exports.deleteOrderRouter = router;
router.delete('/api/orders/:orderId', common_1.currentUser, common_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const order = yield order_1.Order.findById(req.params.orderId).populate('ticket');
    //    console.log('order found', order);
    if (!order) {
        throw new common_1.NotFoundError();
    }
    if (order.userId !== ((_a = req.currentUser) === null || _a === void 0 ? void 0 : _a.id)) {
        throw new common_1.NotAuthorizedError();
    }
    order.status = common_1.OrderStatus.Cancelled;
    //    console.log('order found', order);
    yield order.save();
    //    console.log('order found', order);
    // publishing the event - Order cancelled
    new order_created_publisher_1.OrderCancelledPublisher(nats_wrapper_1.natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        },
    });
    res.status(204).send({}); // 204 means data deleted
}));
