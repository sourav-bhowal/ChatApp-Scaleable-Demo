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
exports.kafka = void 0;
exports.createProducer = createProducer;
exports.startConsumer = startConsumer;
exports.produceMessage = produceMessage;
const kafkajs_1 = require("kafkajs");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("./prisma");
// Initiate Kafka with SSL
exports.kafka = new kafkajs_1.Kafka({
    brokers: ["kafka-chatapp-websoc-chatapp-websockets.h.aivencloud.com:12656"],
    ssl: {
        ca: [fs_1.default.readFileSync(path_1.default.resolve("./ca.pem"), "utf-8")],
    },
    sasl: {
        username: "avnadmin",
        password: "AVNS_vLyUvDPjsCh2r20s6bi",
        mechanism: "plain",
    },
});
// Declare Producer variable
let producer = null;
// Create Producer fn
function createProducer() {
    return __awaiter(this, void 0, void 0, function* () {
        // If Producer exists, return it
        if (producer)
            return producer;
        // Create Producer from Kafka
        const _producer = exports.kafka.producer();
        // Connect to Kafka
        yield _producer.connect();
        // Return Producer
        return _producer;
    });
}
// Create Consumer fn
function startConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Consumer from Kafka
        const _consumer = exports.kafka.consumer({ groupId: "deafult-messages" });
        // Connect to Kafka
        yield _consumer.connect();
        // Subscribe to Kafka "MESSAGES" topic
        yield _consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
        // Run Consumer
        yield _consumer.run({
            autoCommit: true,
            eachMessage: (_a) => __awaiter(this, [_a], void 0, function* ({ message, pause }) {
                var _b;
                // If message is empty, return
                if (!message.value)
                    return;
                console.log("Message Received:", message);
                // Save Message to DB with Prisma if message is not empty
                try {
                    yield prisma_1.prisma.message.create({
                        data: {
                            message: (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString(),
                        },
                    });
                }
                catch (error) {
                    console.log("Some error in Kafka:", error);
                    // If error, pause consumer
                    pause();
                    // Reconnect to Kafka after 60 seconds and cosume again
                    setTimeout(() => {
                        _consumer.resume([{ topic: "MESSAGES" }]);
                    }, 60 * 1000);
                }
            }),
        });
    });
}
// Produce Message fn
function produceMessage(topic, message) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create Producer
        const producer = yield createProducer();
        // Produce Message
        yield producer.send({
            messages: [{ key: `message-${Date.now()}`, value: message }],
            topic: topic,
        });
        // return true
        return true;
    });
}
