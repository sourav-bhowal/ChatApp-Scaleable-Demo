import { Consumer, Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import { prisma } from "./prisma";


// Initiate Kafka with SSL
export const kafka = new Kafka({
  brokers: ["kafka-chatapp-websoc-chatapp-websockets.h.aivencloud.com:12656"],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: "avnadmin",
    password: "AVNS_vLyUvDPjsCh2r20s6bi",
    mechanism: "plain",
  },
});

// Declare Producer variable
let producer: null | Producer = null;

// Create Producer fn
export async function createProducer() {
  // If Producer exists, return it
  if (producer) return producer;
  // Create Producer from Kafka
  const _producer = kafka.producer();
  // Connect to Kafka
  await _producer.connect();
  // Return Producer
  return _producer;
}

// Create Consumer fn
export async function startConsumer() {
  // Create Consumer from Kafka
  const _consumer = kafka.consumer({ groupId: "deafult-messages" });
  // Connect to Kafka
  await _consumer.connect();
  // Subscribe to Kafka "MESSAGES" topic
  await _consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
  // Run Consumer
  await _consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      // If message is empty, return
      if (!message.value) return;
      console.log("Message Received:", message);
      // Save Message to DB with Prisma if message is not empty
      try {
        await prisma.message.create({
          data: {
            message: message.value?.toString(),
          },
        });
      } catch (error) {
        console.log("Some error in Kafka:", error);
        // If error, pause consumer
        pause();
        // Reconnect to Kafka after 60 seconds and cosume again
        setTimeout(() => {
          _consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

// Produce Message fn
export async function produceMessage(topic: string, message: string) {
  // Create Producer
  const producer = await createProducer();
  // Produce Message
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: topic,
  });
  // return true
  return true;
}
