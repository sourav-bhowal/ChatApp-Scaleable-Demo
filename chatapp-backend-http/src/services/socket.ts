import { Server } from "socket.io";
import Redis from "ioredis";
import { prisma } from "./prisma";
import { produceMessage } from "./kafka";

// Publish to redis
const pubRedis = new Redis({
  host: "redis-14871.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 14871,
  username: "default",
  password: "fgBSd6cnMuvlQAbCgdxGXhUHIWt8yyHO",
});

// Subscribe to redis
const subRedis = new Redis({
  host: "redis-14871.c305.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 14871,
  username: "default",
  password: "fgBSd6cnMuvlQAbCgdxGXhUHIWt8yyHO",
});

// Class to manage socket connections
export default class SocketService {
  // Initialise Server
  private _io: Server;

  // Constructor
  constructor() {
    // Create Server
    console.log("Socket Service Initialized!!!");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    // Subscribe to redis
    subRedis.subscribe("MESSAGES");
  }

  // Event Listener
  public initListeners() {
    // Connection
    const io = this.io;
    console.log("Socket Listener Initialized !!!");

    // On Connection
    io.on("connect", (socket) => {
      console.log("New User Socket Connected:", socket.id);

      // On new message
      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New Message:", message);

        // publish the message to redis
        await pubRedis.publish("MESSAGES", JSON.stringify({ message }));
      });
    });

    // On Subscribe
    subRedis.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        console.log("New Message Received:", message);
        // Emit to all clients
        io.emit("message", message);
        // Produce Message to Kafka
        await produceMessage("MESSAGES", message);
        console.log("Message Sent to Kafka");
      }
    });
  }

  // Get Server
  get io() {
    return this._io;
  }
}
