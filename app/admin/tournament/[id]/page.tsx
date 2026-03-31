"use client";
import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Trophy,
  Users,
  Gamepad2,
  BarChart3,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Leaderboard from "@/components/leaderboard/Leaderboard";
import { TopTeamsChart, MatchProgressChart } from "@/components/analytics/Charts";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";

const MAPS = ["Erangel", "Miramar", "Sanhok", "Vikendi"] as const;

interface Tournament {
  _id: string;
  name: string;
  totalTeams: number;
  totalMatches: number;
  killPoints: number;
  winnerPoints: number;
  lastRankPoints: number;
}

interface Team {
  _id: string;
  name: string;
  logo?: string;
}

interface Match {
  _id: string;
  matchNumber: number;
  matchName?: string;
  mapName: string;
}

interface ScoreEntry {
  teamId: string;
  matchId: string;
  kills: number;
  placement: number;
}

type Tab = "teams" | "matches" | "scores" | "leaderboard" | "analytics";

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token, isAdmin } = useAuthStore();
  const router = useRouter();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [scores, setScores] = useState<Map<string, ScoreEntry>>(new Map());
  const [tab, setTab] = useState<Tab>("teams");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Forms
  const [newTeam, setNewTeam] = useState({ name: "", logo: "" });
  const [newMatch, setNewMatch] = useState({ matchName: "", mapName: "Erangel" as typeof MAPS[number] });

  useEffect(() => {
    if (!token || !isAdmin) router.replace("/admin");
  }, [token, isAdmin, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, teamsRes, matchesRes, lbRes, scoresRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/teams?tournamentId=${id}`),
        fetch(`/api/matches?tournamentId=${id}`),
        fetch(`/api/tournaments/${id}/leaderboard`),
        fetch(`/api/scores?tournamentId=${id}`),
      ]);

      const [tData, teamsData, matchesData, lbData, scoresData] = await Promise.all([
        tRes.json(), teamsRes.json(), matchesRes.json(), lbRes.json(), scoresRes.json(),
      ]);

      if (tData.success) setTournament(tData.data);
      if (teamsData.success) setTeams(teamsData.data);
      if (matchesData.success) setMatches(matchesData.data);
      if (lbData.success) setLeaderboard(lbData.data);

      if (scoresData.success) {
        const map = new Map<string, ScoreEntry>();
        scoresData.data.forEach((s: { teamId: { _id: string } | string; matchId: { _id: string } | string; kills: number; placement: number }) => {
          const teamId = typeof s.teamId === "object" ? s.teamId._id : s.teamId;
          const matchId = typeof s.matchId === "object" ? s.matchId._id : s.matchId;
          map.set(`${teamId}:${matchId}`, { teamId, matchId, kills: s.kills, placement: s.placement });
        });
        setScores(map);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (token && id) fetchAll();
  }, [token, id, fetchAll]);

  const addTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) return;
    setSaving("team");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newTeam, tournamentId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setTeams((prev) => [...prev, data.data]);
        setNewTeam({ name: "", logo: "" });
      }
    } finally {
      setSaving(null);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!confirm("Delete this team?")) return;
    await fetch(`/api/teams/${teamId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setTeams((prev) => prev.filter((t) => t._id !== teamId));
  };

  const addMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("match");
    const matchNumber = matches.length + 1;
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newMatch, tournamentId: id, matchNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setMatches((prev) => [...prev, data.data]);
        const nextMap = MAPS[(matchNumber) % MAPS.length];
        setNewMatch({ matchName: "", mapName: nextMap });
      }
    } finally {
      setSaving(null);
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!confirm("Delete this match and all its scores?")) return;
    await fetch(`/api/matches/${matchId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMatches((prev) => prev.filter((m) => m._id !== matchId));
  };

  const updateScore = async (teamId: string, matchId: string, kills: number, placement: number) => {
    const key = `${teamId}:${matchId}`;
    setSaving(key);
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ teamId, matchId, tournamentId: id, kills, placement }),
      });
      const data = await res.json();
      if (data.success) {
        setScores((prev) => {
          const next = new Map(prev);
          next.set(key, { teamId, matchId, kills, placement });
          return next;
        });
        // Refresh leaderboard
        const lbRes = await fetch(`/api/tournaments/${id}/leaderboard`);
        const lbData = await lbRes.json();
        if (lbData.success) setLeaderboard(lbData.data);
      }
    } finally {
      setSaving(null);
    }
  };

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/exportExcel");
    await exportToExcel(leaderboard, tournament?.name ?? "tournament");
  };

  const handleExportPDF = async () => {
    const { exportToPDF } = await import("@/lib/exportPDF");
    exportToPDF(leaderboard, tournament?.name ?? "tournament");
  };

  const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "teams", label: "Teams", icon: Users },
    { id: "matches", label: "Matches", icon: Gamepad2 },
    { id: "scores", label: "Scores", icon: Save },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        Tournament not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-black text-white truncate text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
                {tournament.name}
              </h1>
              <p className="text-xs text-gray-500">
                {teams.length}/{tournament.totalTeams} teams · {matches.length}/{tournament.totalMatches} matches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={fetchAll}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link href={`/tournament/${id}/live`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" /> Live View
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="w-4 h-4 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-yellow-400 text-yellow-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* TEAMS TAB */}
          {tab === "teams" && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <h2 className="font-bold text-white">Add Team</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addTeam} className="flex gap-3">
                    <Input
                      value={newTeam.name}
                      onChange={(e) => setNewTeam((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Team name"
                      required
                      className="flex-1"
                    />
                    <Input
                      value={newTeam.logo}
                      onChange={(e) => setNewTeam((p) => ({ ...p, logo: e.target.value }))}
                      placeholder="Logo URL (optional)"
                      className="flex-1"
                    />
                    <Button type="submit" disabled={saving === "team"}>
                      {saving === "team" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-2">
                {teams.map((team, i) => (
                  <motion.div
                    key={team._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-400/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {team.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-sm font-bold text-yellow-400">
                          {team.name.charAt(0)}
                        </div>
                      )}
                      <span className="text-white font-medium">{team.name}</span>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => deleteTeam(team._id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
                {teams.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No teams yet. Add your first team above.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* MATCHES TAB */}
          {tab === "matches" && (
            <motion.div
              key="matches"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <h2 className="font-bold text-white">Add Match</h2>
                </CardHeader>
                <CardContent>
                  <form onSubmit={addMatch} className="flex gap-3">
                    <Input
                      value={newMatch.matchName}
                      onChange={(e) => setNewMatch((p) => ({ ...p, matchName: e.target.value }))}
                      placeholder={`Match ${matches.length + 1} name (optional)`}
                      className="flex-1"
                    />
                    <Select
                      value={newMatch.mapName}
                      onChange={(e) => setNewMatch((p) => ({ ...p, mapName: e.target.value as typeof MAPS[number] }))}
                      className="w-40"
                    >
                      {MAPS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Select>
                    <Button type="submit" disabled={saving === "match"}>
                      {saving === "match" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-2">
                {matches.map((match) => (
                  <div
                    key={match._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center text-sm font-bold text-blue-400">
                        {match.matchNumber}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {match.matchName || `Match ${match.matchNumber}`}
                        </div>
                        <div className="text-xs text-gray-500">{match.mapName}</div>
                      </div>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => deleteMatch(match._id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {matches.length === 0 && (
                  <p className="text-center py-8 text-gray-500">No matches yet. Add your first match above.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* SCORES TAB */}
          {tab === "scores" && (
            <motion.div
              key="scores"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {teams.length === 0 || matches.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">Add teams and matches first to enter scores.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <Card key={match._id}>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center text-sm font-bold text-purple-400">
                            {match.matchNumber}
                          </div>
                          <div>
                            <h3 className="font-bold text-white">{match.matchName || `Match ${match.matchNumber}`}</h3>
                            <p className="text-xs text-gray-500">{match.mapName}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {/* Header */}
                          <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-500 uppercase px-2 pb-1 border-b border-white/5">
                            <span className="col-span-2">Team</span>
                            <span className="text-center">Kills</span>
                            <span className="text-center">Rank</span>
                          </div>
                          {teams.map((team) => {
                            const key = `${team._id}:${match._id}`;
                            const existing = scores.get(key);
                            const scoreKey = `${key}:${existing?.kills ?? ""}:${existing?.placement ?? ""}`;
                            return (
                              <ScoreRow
                                key={scoreKey}
                                team={team}
                                match={match}
                                existing={existing}
                                saving={saving === key}
                                onSave={(kills, placement) => updateScore(team._id, match._id, kills, placement)}
                              />
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* LEADERBOARD TAB */}
          {tab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  LIVE LEADERBOARD
                </h2>
                <Link href={`/tournament/${id}/live`} target="_blank">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" /> Public View
                  </Button>
                </Link>
              </div>
              <Leaderboard entries={leaderboard} matches={matches} />
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-white">Top Teams by Score</h3>
                  </CardHeader>
                  <CardContent>
                    <TopTeamsChart entries={leaderboard} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <h3 className="font-bold text-white">Match Progress (Top 5)</h3>
                  </CardHeader>
                  <CardContent>
                    <MatchProgressChart entries={leaderboard} />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Score entry row component
function ScoreRow({
  team,
  existing,
  saving,
  onSave,
}: {
  team: Team;
  match: Match;
  existing?: ScoreEntry;
  saving: boolean;
  onSave: (kills: number, placement: number) => void;
}) {
  const [localKills, setLocalKills] = useState(existing?.kills ?? 0);
  const [localPlacement, setLocalPlacement] = useState(existing?.placement ?? 1);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="grid grid-cols-4 gap-2 items-center px-2 py-1 rounded-lg hover:bg-white/3 transition-colors">
      <div className="col-span-2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center text-xs font-bold text-yellow-400">
          {team.name.charAt(0)}
        </div>
        <span className="text-sm text-white truncate">{team.name}</span>
      </div>
      <div>
        <Input
          type="number"
          min={0}
          value={localKills}
          onChange={(e) => { setLocalKills(parseInt(e.target.value) || 0); setDirty(true); }}
          className="text-center h-8 text-sm"
        />
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={1}
          value={localPlacement}
          onChange={(e) => { setLocalPlacement(parseInt(e.target.value) || 1); setDirty(true); }}
          className="text-center h-8 text-sm flex-1"
        />
        {dirty && (
          <button
            onClick={() => { onSave(localKills, localPlacement); setDirty(false); }}
            disabled={saving}
            className="w-7 h-8 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
