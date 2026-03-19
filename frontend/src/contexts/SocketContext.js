"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const WS_URL = API_URL.replace(/\/$/, "");

const SocketContext = createContext({ alerts: [], dismissAlert: () => {} });

export function SocketProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const socket = io(WS_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => {
      console.log("[Notifications] Socket connected to", WS_URL);
    });
    socket.on("connect_error", (err) => {
      console.warn("[Notifications] Socket connection error:", err.message);
    });
    socket.on("stock-alert", (payload) => {
      setAlerts((prev) => [...prev.slice(-4), { id: Date.now(), ...payload }]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <SocketContext.Provider value={{ alerts, dismissAlert }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useStockAlerts() {
  return useContext(SocketContext);
}
