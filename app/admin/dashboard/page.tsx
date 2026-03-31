"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { motion } from "framer-motion";
import { Plus, Trophy, Users, Gamepad2, BarChart3, LogOut, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Link from "next/link";

interface Tournament {
  _id: string;
  name: string;
  totalTeams: number;
  totalMatches: number;
  killPoints: number;
  winnerPoints: number;
  lastRankPoints: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const { token, isAdmin, logout } = useAuthStore();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isAdmin) {
      router.replace("/admin");
    }
  }, [token, isAdmin, router]);

  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch("/api/tournaments");
      const data = await res.json();
      if (data.success) setTournaments(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchTournaments();
  }, [token, fetchTournaments]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/admin");
  };

  const handleDeleteTournament = async (id: string) => {
    if (!confirm("Delete this tournament and all its data?")) return;
    await fetch(`/api/tournaments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTournaments();
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <span className="font-black text-white tracking-wide" style={{ fontFamily: "Orbitron, sans-serif" }}>
              BGMI DASHBOARD
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">Home</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Trophy, label: "Tournaments", value: tournaments.length, color: "text-yellow-400" },
            { icon: Users, label: "Total Teams", value: tournaments.reduce((s, t) => s + t.totalTeams, 0), color: "text-blue-400" },
            { icon: Gamepad2, label: "Total Matches", value: tournaments.reduce((s, t) => s + t.totalMatches, 0), color: "text-purple-400" },
            { icon: BarChart3, label: "Avg Kill Pts", value: tournaments.length ? Math.round(tournaments.reduce((s, t) => s + t.killPoints, 0) / tournaments.length) : 0, color: "text-green-400" },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Tournaments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
              TOURNAMENTS
            </h2>
            <Link href="/admin/tournament/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" /> New Tournament
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : tournaments.length === 0 ? (
            <Card className="p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400/30" />
              <p className="text-gray-500 mb-4">No tournaments yet</p>
              <Link href="/admin/tournament/new">
                <Button><Plus className="w-4 h-4 mr-1" /> Create Tournament</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.map((t, i) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card glow className="group hover:border-yellow-400/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white truncate">{t.name}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-yellow-400 font-bold">{t.totalTeams}</div>
                          <div className="text-xs text-gray-500">Teams</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-blue-400 font-bold">{t.totalMatches}</div>
                          <div className="text-xs text-gray-500">Matches</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-green-400 font-bold">{t.killPoints}</div>
                          <div className="text-xs text-gray-500">Kill Pts</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/admin/tournament/${t._id}`} className="flex-1">
                          <Button size="sm" className="w-full">
                            Manage <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                        <Link href={`/tournament/${t._id}/live`}>
                          <Button size="sm" variant="outline">Live</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteTournament(t._id)}
                        >
                          Del
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
