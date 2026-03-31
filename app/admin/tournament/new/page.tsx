"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Trophy, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NewTournamentPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    totalTeams: 16,
    totalMatches: 6,
    killPoints: 1,
    winnerPoints: 15,
    lastRankPoints: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/admin/tournament/${data.data._id}`);
      } else {
        setError(typeof data.error === "string" ? data.error : "Failed to create tournament");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields: Array<{ name: keyof typeof form; label: string; type: string; min?: number; max?: number; step?: number }> = [
    { name: "totalTeams", label: "Total Teams", type: "number", min: 2, max: 100 },
    { name: "totalMatches", label: "Total Matches", type: "number", min: 1, max: 50 },
    { name: "killPoints", label: "Points per Kill", type: "number", min: 0, step: 0.5 },
    { name: "winnerPoints", label: "Winner (Rank 1) Points", type: "number", min: 0 },
    { name: "lastRankPoints", label: "Last Rank Points", type: "number", min: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card glow>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
                    NEW TOURNAMENT
                  </h1>
                  <p className="text-xs text-gray-500">Configure tournament settings</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Tournament Name
                  </label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="BGMI Pro League Season 1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {fields.map((f) => (
                    <div key={f.name} className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {f.label}
                      </label>
                      <Input
                        name={f.name}
                        type={f.type}
                        value={form[f.name]}
                        onChange={handleChange}
                        min={f.min}
                        max={f.max}
                        step={f.step ?? 1}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Placement curve info */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3 text-xs text-gray-400">
                  <p className="text-yellow-400 font-semibold mb-1">📐 Placement Curve</p>
                  <p>Rank 1 → {form.winnerPoints} pts | Rank {form.totalTeams} → {form.lastRankPoints} pts</p>
                  <p className="mt-1">Ranks 2–{form.totalTeams - 1} use linear interpolation between these values.</p>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
                  {loading ? "Creating…" : "Create Tournament"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
