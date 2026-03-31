"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";

interface AnalyticsChartsProps {
  entries: LeaderboardEntry[];
}

const COLORS = [
  "#facc15",
  "#f97316",
  "#ef4444",
  "#a78bfa",
  "#34d399",
  "#60a5fa",
  "#f472b6",
  "#fb923c",
];

export function TopTeamsChart({ entries }: AnalyticsChartsProps) {
  const data = entries.slice(0, 8).map((e) => ({
    name: e.teamName.length > 10 ? e.teamName.slice(0, 10) + "…" : e.teamName,
    score: e.totalScore,
    rank: e.rank,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #facc1530",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Bar dataKey="score" fill="#facc15" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MatchProgressChart({ entries }: AnalyticsChartsProps) {
  const top5 = entries.slice(0, 5);
  if (!top5.length || !top5[0].matchScores.length) return null;

  const matchCount = top5[0].matchScores.length;
  const data = Array.from({ length: matchCount }, (_, i) => {
    const row: Record<string, number | string> = { match: `M${i + 1}` };
    top5.forEach((e) => {
      let sum = 0;
      for (let j = 0; j <= i; j++) {
        sum += e.matchScores[j]?.score ?? 0;
      }
      row[e.teamName] = sum;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
        <XAxis dataKey="match" tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #facc1530",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
        {top5.map((e, i) => (
          <Line
            key={e.teamId}
            type="monotone"
            dataKey={e.teamName}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
