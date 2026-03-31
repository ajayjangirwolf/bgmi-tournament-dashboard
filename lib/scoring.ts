/**
 * Placement points curve:
 * Rank 1 → winnerPoints
 * Rank N (last) → lastRankPoints
 * Ranks 2..N-1 → linear interpolation
 */
export function calcPlacementPoints(
  rank: number,
  totalTeams: number,
  winnerPoints: number,
  lastRankPoints: number
): number {
  if (totalTeams <= 0) return 0;
  if (rank <= 0) return 0;
  if (rank === 1) return winnerPoints;
  if (rank >= totalTeams) return lastRankPoints;

  // Linear interpolation between winnerPoints and lastRankPoints
  const ratio = (rank - 1) / (totalTeams - 1);
  const points = winnerPoints + ratio * (lastRankPoints - winnerPoints);
  return Math.round(points);
}

export function calcMatchScore(
  kills: number,
  placement: number,
  totalTeams: number,
  killPoints: number,
  winnerPoints: number,
  lastRankPoints: number
): number {
  const placementPts = calcPlacementPoints(
    placement,
    totalTeams,
    winnerPoints,
    lastRankPoints
  );
  return kills * killPoints + placementPts;
}
