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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderCreatedListener = void 0;
const common_1 = require("@weworkbetter/common");
const queue_group_name_1 = require("./queue-group-name");
const expiration_queue_1 = require("../../queue/expiration-queue");
class OrderCreatedListener extends common_1.Listener {
    constructor() {
        super(...arguments);
        this.subject = common_1.Subjects.OrderCreated;
        this.queueGroupName = queue_group_name_1.queueGroupName;
    }
    onMessage(data, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
            yield expiration_queue_1.expirationQueue.add({
                orderId: data.id,
            }, {
                delay,
            });
            console.log(`delay - 5000`);
            msg.ack();
        });
    }
}
exports.OrderCreatedListener = OrderCreatedListener;
