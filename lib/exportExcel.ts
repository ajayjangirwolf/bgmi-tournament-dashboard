import ExcelJS from "exceljs";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";

export async function exportToExcel(
  entries: LeaderboardEntry[],
  tournamentName: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leaderboard");

  const matchCount = entries[0]?.matchScores.length ?? 0;

  // Headers
  const headers = [
    "Rank",
    "Team",
    ...Array.from({ length: matchCount }, (_, i) => `Match ${i + 1}`),
    "Total Score",
  ];
  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } };
    cell.font = { bold: true, color: { argb: "FFFACC15" } };
    cell.alignment = { horizontal: "center" };
  });

  entries.forEach((entry) => {
    const row = [
      entry.rank,
      entry.teamName,
      ...entry.matchScores.map((m) => m.score),
      entry.totalScore,
    ];
    sheet.addRow(row);
  });

  // Auto width
  sheet.columns.forEach((col) => {
    col.width = 14;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${tournamentName}-leaderboard.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
