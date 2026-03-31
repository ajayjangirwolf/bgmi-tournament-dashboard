"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

interface Tournament {
  _id: string;
  name: string;
  totalTeams: number;
  totalMatches: number;
  createdAt: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((r) => r.json())
      .then((d) => { if (d.success) setTournaments(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(250,204,21,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250,204,21,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
            TOURNAMENTS
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400/20" />
            <p className="text-gray-500">No tournaments yet.</p>
            <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 text-sm mt-2 inline-block">
              Go to Admin Panel →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card glow className="hover:border-yellow-400/40 transition-all duration-300">
                  <CardHeader>
                    <h2 className="font-bold text-white truncate">{t.name}</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3 text-sm">
                      <span className="text-gray-400">{t.totalTeams} teams</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-400">{t.totalMatches} matches</span>
                    </div>
                    <Link href={`/tournament/${t._id}/live`}>
                      <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-semibold hover:bg-yellow-400/20 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        View Live Leaderboard
                      </button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
