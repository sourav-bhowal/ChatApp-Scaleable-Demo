import http from "http";
import SocketService from "./services/socket";
import { startConsumer } from "./services/kafka";

// Initialise Server
async function init() {
  // Consume Messages from Kafka
  startConsumer();

  // Create Socket Service
  const socketService = new SocketService();

  // Create Server
  const httpServer = http.createServer();

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
}

init();
