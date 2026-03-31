"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  matches: { _id: string; matchNumber: number; matchName?: string }[];
}

const rankColors = {
  1: "from-yellow-500/20 to-yellow-600/5 border-yellow-400/40 text-yellow-300",
  2: "from-gray-300/20 to-gray-400/5 border-gray-300/40 text-gray-300",
  3: "from-orange-500/20 to-orange-600/5 border-orange-400/40 text-orange-300",
};

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-gray-300" />;
  if (rank === 3) return <Star className="w-4 h-4 text-orange-400" />;
  return <span className="text-xs text-gray-500 font-mono w-4 text-center">#{rank}</span>;
};

export default function Leaderboard({ entries, matches }: LeaderboardProps) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="hidden md:grid gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
        style={{ gridTemplateColumns: `60px 1fr repeat(${Math.min(matches.length, 6)}, 60px) 80px` }}>
        <span>Rank</span>
        <span>Team</span>
        {matches.slice(0, 6).map((m) => (
          <span key={m._id} className="text-center">M{m.matchNumber}</span>
        ))}
        <span className="text-right">Total</span>
      </div>

      <AnimatePresence>
        {entries.map((entry) => {
          const rankKey = entry.rank as 1 | 2 | 3;
          const isTop3 = entry.rank <= 3;

          return (
            <motion.div
              key={entry.teamId}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 25 }}
              className={cn(
                "grid gap-2 px-4 py-3 rounded-xl border backdrop-blur-sm",
                "bg-gradient-to-r transition-all duration-300",
                isTop3
                  ? rankColors[rankKey]
                  : "from-white/5 to-white/2 border-white/10 text-gray-300"
              )}
              style={{ gridTemplateColumns: `60px 1fr repeat(${Math.min(matches.length, 6)}, 60px) 80px` }}
            >
              {/* Rank */}
              <div className="flex items-center gap-1">
                <RankIcon rank={entry.rank} />
              </div>

              {/* Team name */}
              <div className="flex items-center gap-2 min-w-0">
                {entry.teamLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.teamLogo}
                    alt={entry.teamName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-bold text-yellow-400">
                    {entry.teamName.charAt(0)}
                  </div>
                )}
                <span className="font-semibold truncate text-sm">{entry.teamName}</span>
                {entry.rank === 1 && (
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="hidden sm:inline-flex items-center gap-1 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full"
                  >
                    <Trophy className="w-3 h-3" /> LEADER
                  </motion.span>
                )}
              </div>

              {/* Match scores */}
              {matches.slice(0, 6).map((m) => {
                const ms = entry.matchScores.find((s) => s.matchId === m._id);
                return (
                  <div key={m._id} className="text-center text-xs">
                    <span className={ms?.score ? "text-yellow-300" : "text-gray-600"}>
                      {ms?.score ?? "-"}
                    </span>
                  </div>
                );
              })}

              {/* Total */}
              <div className="text-right">
                <span className={cn(
                  "font-bold text-sm font-mono",
                  isTop3 ? "text-white" : "text-gray-300"
                )}>
                  {entry.totalScore}
                </span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {entries.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No teams registered yet</p>
        </div>
      )}
    </div>
  );
}
