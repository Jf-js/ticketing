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
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
jest.mock('../nats-wrapper');
// this declaration over here is to increase its scope
// so that it is available inside ofthe afterAll hook as well.
let mongo;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    process.env.JWT_KEY = 'asd';
    mongo = yield mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    yield mongoose_1.default.connect(mongoUri, {});
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    jest.clearAllMocks();
    const collections = yield mongoose_1.default.connection.db.collections();
    for (let collection of collections) {
        yield collection.deleteMany();
    }
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    if (mongo) {
        yield mongo.stop();
    }
    yield mongoose_1.default.connection.close();
}));
global.signin = () => {
    // Build a JWT payload. {id, email}
    const payload = {
        id: new mongoose_1.default.Types.ObjectId().toHexString(),
        email: 'a@a.com',
    };
    // Create a JWT
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_KEY);
    // Build session object. { jwt: MY_JWT}
    const session = { jwt: token };
    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);
    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');
    // return a string thats the cookie with the encoded data
    return [`session=${base64}`];
};
