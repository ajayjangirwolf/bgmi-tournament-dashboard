"use client";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Trophy, Wifi, WifiOff, RefreshCw } from "lucide-react";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { useSocket } from "@/hooks/useSocket";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";
import dynamic from "next/dynamic";

const ThreeBackground = dynamic(() => import("@/components/three/ThreeBackground"), { ssr: false });

interface Match {
  _id: string;
  matchNumber: number;
  matchName?: string;
}

interface Tournament {
  name: string;
  totalTeams: number;
  totalMatches: number;
}

export default function LiveLeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [lbRes, matchesRes, tRes] = await Promise.all([
        fetch(`/api/tournaments/${id}/leaderboard`),
        fetch(`/api/matches?tournamentId=${id}`),
        fetch(`/api/tournaments/${id}`),
      ]);
      const [lbData, matchesData, tData] = await Promise.all([
        lbRes.json(), matchesRes.json(), tRes.json(),
      ]);
      if (lbData.success) setLeaderboard(lbData.data);
      if (matchesData.success) setMatches(matchesData.data);
      if (tData.success) setTournament(tData.data);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const socketRef = useSocket({
    tournamentId: id,
    onLeaderboardUpdate: (data) => {
      setLeaderboard(data as LeaderboardEntry[]);
      setLastUpdate(new Date());
    },
  });

  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    return () => {
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
    };
  }, [socketRef]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <ThreeBackground />

      {/* Header */}
      <header className="relative z-10 border-b border-yellow-400/10 bg-[#0a0a0a]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-12 h-12 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-black text-white"
                  style={{
                    fontFamily: "Orbitron, sans-serif",
                    textShadow: "0 0 20px rgba(250,204,21,0.5)",
                  }}
                >
                  {tournament?.name ?? "Loading…"}
                </h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-sm text-gray-400">
                    {matches.length} matches · {leaderboard.length} teams
                  </span>
                  {lastUpdate && (
                    <span className="text-xs text-gray-600">
                      Updated {lastUpdate.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                  connected
                    ? "text-green-400 border-green-400/30 bg-green-400/10"
                    : "text-gray-500 border-gray-700 bg-gray-800/50"
                }`}
              >
                {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {connected ? "LIVE" : "Offline"}
              </motion.div>
              <button
                onClick={fetchData}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Leaderboard */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, podiumI) => {
              const podiumColors = ["text-gray-300", "text-yellow-400", "text-orange-400"];
              const podiumBg = [
                "bg-gray-300/10 border-gray-300/20",
                "bg-yellow-400/10 border-yellow-400/30",
                "bg-orange-400/10 border-orange-400/20",
              ];
              const heights = ["h-20", "h-28", "h-16"];
              const icons = ["🥈", "🥇", "🥉"];

              return (
                <motion.div
                  key={entry.teamId}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: podiumI * 0.1 }}
                  className={`flex flex-col items-center justify-end rounded-xl border p-3 ${podiumBg[podiumI]} ${heights[podiumI]}`}
                >
                  <span className="text-lg mb-1">{icons[podiumI]}</span>
                  <span className={`text-xs font-bold truncate max-w-full ${podiumColors[podiumI]}`}>
                    {entry.teamName}
                  </span>
                  <span className={`text-sm font-mono font-black ${podiumColors[podiumI]}`}>
                    {entry.totalScore}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Trophy className="w-10 h-10 text-yellow-400" />
            </motion.div>
          </div>
        ) : (
          <Leaderboard entries={leaderboard} matches={matches} />
        )}
      </main>

      {/* Animated bottom border */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
    </div>
  );
}
