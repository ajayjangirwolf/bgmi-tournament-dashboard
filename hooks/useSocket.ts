"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";

interface UseSocketOptions {
  tournamentId: string;
  onLeaderboardUpdate?: (data: LeaderboardEntry[]) => void;
  onScoreUpdate?: (data: unknown) => void;
}

export function useSocket({
  tournamentId,
  onLeaderboardUpdate,
  onScoreUpdate,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  // Keep latest callbacks in refs to avoid stale closures
  const onLeaderboardRef = useRef(onLeaderboardUpdate);
  const onScoreRef = useRef(onScoreUpdate);

  // Update refs synchronously before any effects run
  useLayoutEffect(() => {
    onLeaderboardRef.current = onLeaderboardUpdate;
    onScoreRef.current = onScoreUpdate;
  });

  useEffect(() => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const socket = io(appUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-tournament", tournamentId);
    });

    socket.on("leaderboardUpdated", (data: LeaderboardEntry[]) => {
      onLeaderboardRef.current?.(data);
    });

    socket.on("scoreUpdated", (data: unknown) => {
      onScoreRef.current?.(data);
    });

    return () => {
      socket.emit("leave-tournament", tournamentId);
      socket.disconnect();
    };
  }, [tournamentId]);

  return socketRef;
}

