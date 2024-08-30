"use client";
import { useSocket } from "@/context/SocketProvider";
import { useState } from "react";

export default function Page() {
  // Send message using context
  const { sendMessage, allMessages } = useSocket();

  // state for message
  const [message, setMessage] = useState("");
  console.log(allMessages);
  return (
    <main className="flex flex-col h-screen items-center gap-5 p-10">
      <h1 className="text-4xl">Chat App</h1>
      <div className="flex gap-5">
        <input
          type="text"
          name="message"
          id="message"
          className="p-2 rounded-lg text-black"
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="px-5 py-4 rounded-lg bg-green-600 text-white hover:scale-105 transition-all"
          onClick={() => sendMessage(message)}
        >
          Send
        </button>
      </div>

      <div>
        <h2 className="text-2xl">All Messages</h2>
        <ul>
          {allMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
