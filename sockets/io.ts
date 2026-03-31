import { Server as SocketIOServer } from "socket.io";
import { Server as NetServer } from "http";

let io: SocketIOServer | null = null;

export function initSocket(httpServer: NetServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL ?? "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("[Socket] Client connected:", socket.id);

    socket.on("join-tournament", (tournamentId: string) => {
      socket.join(`tournament:${tournamentId}`);
      console.log(`[Socket] ${socket.id} joined tournament:${tournamentId}`);
    });

    socket.on("leave-tournament", (tournamentId: string) => {
      socket.leave(`tournament:${tournamentId}`);
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastLeaderboardUpdate(tournamentId: string, data: unknown) {
  if (!io) return;
  io.to(`tournament:${tournamentId}`).emit("leaderboardUpdated", data);
}

export function broadcastScoreUpdate(tournamentId: string, data: unknown) {
  if (!io) return;
  io.to(`tournament:${tournamentId}`).emit("scoreUpdated", data);
}
