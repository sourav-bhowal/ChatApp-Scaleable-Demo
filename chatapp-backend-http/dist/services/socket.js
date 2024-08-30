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
const socket_io_1 = require("socket.io");
const ioredis_1 = __importDefault(require("ioredis"));
const kafka_1 = require("./kafka");
// Publish to redis
const pubRedis = new ioredis_1.default({
    host: "redis-14871.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14871,
    username: "default",
    password: "fgBSd6cnMuvlQAbCgdxGXhUHIWt8yyHO",
});
// Subscribe to redis
const subRedis = new ioredis_1.default({
    host: "redis-14871.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 14871,
    username: "default",
    password: "fgBSd6cnMuvlQAbCgdxGXhUHIWt8yyHO",
});
// Class to manage socket connections
class SocketService {
    // Constructor
    constructor() {
        // Create Server
        console.log("Socket Service Initialized!!!");
        this._io = new socket_io_1.Server({
            cors: {
                allowedHeaders: ["*"],
                origin: "*",
            },
        });
        // Subscribe to redis
        subRedis.subscribe("MESSAGES");
    }
    // Event Listener
    initListeners() {
        // Connection
        const io = this.io;
        console.log("Socket Listener Initialized !!!");
        // On Connection
        io.on("connect", (socket) => {
            console.log("New User Socket Connected:", socket.id);
            // On new message
            socket.on("event:message", (_a) => __awaiter(this, [_a], void 0, function* ({ message }) {
                console.log("New Message:", message);
                // publish the message to redis
                yield pubRedis.publish("MESSAGES", JSON.stringify({ message }));
            }));
        });
        // On Subscribe
        subRedis.on("message", (channel, message) => __awaiter(this, void 0, void 0, function* () {
            if (channel === "MESSAGES") {
                console.log("New Message Received:", message);
                // Emit to all clients
                io.emit("message", message);
                // Produce Message to Kafka
                yield (0, kafka_1.produceMessage)("MESSAGES", message);
                console.log("Message Sent to Kafka");
            }
        }));
    }
    // Get Server
    get io() {
        return this._io;
    }
}
exports.default = SocketService;
