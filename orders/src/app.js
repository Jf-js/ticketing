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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const body_parser_1 = require("body-parser");
const cookie_session_1 = __importDefault(require("cookie-session"));
const common_1 = require("@weworkbetter/common");
const delete_1 = require("./routes/delete");
const index_1 = require("./routes/index");
const new_1 = require("./routes/new");
const show_1 = require("./routes/show");
const app = (0, express_1.default)();
exports.app = app;
// This is a setting related to the cookie part.
// very specifically with respect to the https security improvement.
// The reason for this that, traffic is now being proxied through
// ingress-nginx in the k8s cluster. Express is going to see that this
// request is proxied, and seeing this proxy, express will not trust this
// incoming https connection. The below setting make it explicit to
// Express that please trust the proxy.
app.set('trust proxy', true);
app.use((0, body_parser_1.json)());
app.use((0, cookie_session_1.default)({
    // The cookies are not encrypted,
    // as this is not a need for a
    // non protected data encoded in a JWT
    signed: false,
    // The cookies are enabled only if the connection is over an https protocol,
    // this is just a security improvement.
    secure: process.env.NODE_ENV !== 'test',
}));
//app.use(currentUser);
app.use(delete_1.deleteOrderRouter);
app.use(index_1.indexOrderRouter);
app.use(new_1.newOrderRouter);
app.use(show_1.showOrderRouter);
app.all('*', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.url);
    throw new common_1.NotFoundError();
}));
app.use(common_1.errorHandler);
