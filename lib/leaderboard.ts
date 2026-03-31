import { connectDB } from "@/lib/db";
import Score from "@/models/Score";
import Team from "@/models/Team";
import Match from "@/models/Match";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";

export async function buildLeaderboard(tournamentId: string): Promise<LeaderboardEntry[]> {
  await connectDB();

  const [teams, matches, scores] = await Promise.all([
    Team.find({ tournamentId }).lean(),
    Match.find({ tournamentId }).sort({ matchNumber: 1 }).lean(),
    Score.find({ tournamentId }).lean(),
  ]);

  const scoreMap = new Map<string, Map<string, (typeof scores)[0]>>();
  for (const score of scores) {
    const teamKey = score.teamId.toString();
    const matchKey = score.matchId.toString();
    if (!scoreMap.has(teamKey)) scoreMap.set(teamKey, new Map());
    scoreMap.get(teamKey)!.set(matchKey, score);
  }

  const leaderboard: LeaderboardEntry[] = teams.map((team) => {
    const teamKey = team._id.toString();
    const teamScores = scoreMap.get(teamKey) ?? new Map();

    const matchScores = matches.map((match) => {
      const matchKey = match._id.toString();
      const s = teamScores.get(matchKey);
      return {
        matchId: matchKey,
        matchNumber: match.matchNumber,
        score: s?.totalScore ?? 0,
        kills: s?.kills ?? 0,
        placement: s?.placement ?? 0,
      };
    });

    const totalScore = matchScores.reduce((sum, m) => sum + m.score, 0);

    return {
      rank: 0,
      teamId: teamKey,
      teamName: team.name,
      teamLogo: team.logo,
      matchScores,
      totalScore,
    };
  });

  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  leaderboard.forEach((entry, i) => {
    entry.rank = i + 1;
  });

  return leaderboard;
}
