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
const http_1 = __importDefault(require("http"));
const socket_1 = __importDefault(require("./services/socket"));
const kafka_1 = require("./services/kafka");
// Initialise Server
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Consume Messages from Kafka
        (0, kafka_1.startConsumer)();
        // Create Socket Service
        const socketService = new socket_1.default();
        // Create Server
        const httpServer = http_1.default.createServer();
        // Port
        const PORT = process.env.PORT ? process.env.PORT : 8000;
        // Add Socket to Server
        socketService.io.attach(httpServer);
        // Listen to port
        httpServer.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
        // Event Listener
        socketService.initListeners();
    });
}
init();
