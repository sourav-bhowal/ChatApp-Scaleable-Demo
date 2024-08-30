"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

// Interface for Socket Provider
interface SocketProviderProps {
  children?: React.ReactNode;
}

// Interface for Socket Context
interface SocketContextProps {
  sendMessage: (message: string) => void;
  allMessages: string[];
}

// Create a context
const SocketContext = createContext<SocketContextProps | null>(null);

// Create a provider
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // State for socket
  const [socket, setSocket] = useState<Socket>();
  // State for message
  const [allMessages, setAllMessages] = useState<string[]>([]);

  // Create a sendMessage function
  const sendMessage: SocketContextProps["sendMessage"] = useCallback(
    (message) => {
      console.log("Message Sent:", message);

      // emit the message
      if (socket) {
        socket.emit("event:message", {
          message: message,
        });
      }
    },
    [socket]
  );

  // Create a Receive messages fn
  const receiveMessage = useCallback((msg: string) => {
    console.log("Message Received from Redis Server:", msg);

    // parse the messages to json
    const { message } = JSON.parse(msg) as { message: string };

    // set the message
    setAllMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  // Create a socket instance on mount and disconnect on unmount
  useEffect(() => {
    // connect to the socket
    const _socket = io("http://localhost:8000");
    // subscribe to messages
    _socket.on("message", receiveMessage);
    // set the socket
    setSocket(_socket);

    // disconnect on unmount
    return () => {
      _socket.disconnect();
      _socket.off("message", receiveMessage);
      setSocket(undefined);
    };
  }, [receiveMessage]);

  // Return the provider
  return (
    <SocketContext.Provider value={{ sendMessage, allMessages }}>
      {children}
    </SocketContext.Provider>
  );
};

// Create a hook to use the context
export const useSocket = () => {
  // Get the context
  const context = useContext(SocketContext);

  // Throw an error if the context is not found
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  // Return the context
  return context;
};
