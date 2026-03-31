import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LeaderboardEntry } from "@/app/api/tournaments/[id]/leaderboard/route";

export function exportToPDF(
  entries: LeaderboardEntry[],
  tournamentName: string
): void {
  const doc = new jsPDF({ orientation: "landscape" });

  // Title
  doc.setFontSize(20);
  doc.setTextColor(250, 204, 21);
  doc.text("BGMI Tournament Results", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(200, 200, 200);
  doc.text(tournamentName, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 37);

  // Top 3
  const top3 = entries.slice(0, 3);
  doc.setFontSize(14);
  doc.setTextColor(250, 204, 21);
  doc.text("🏆 Top 3", 14, 50);

  top3.forEach((e, i) => {
    const medals = ["🥇", "🥈", "🥉"];
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${medals[i]} ${e.teamName} — ${e.totalScore} pts`,
      14,
      60 + i * 8
    );
  });

  const matchCount = entries[0]?.matchScores.length ?? 0;

  // Table
  const head = [
    [
      "Rank",
      "Team",
      ...Array.from({ length: matchCount }, (_, i) => `M${i + 1}`),
      "Total",
    ],
  ];

  const body = entries.map((e) => [
    e.rank,
    e.teamName,
    ...e.matchScores.map((m) => m.score),
    e.totalScore,
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 88,
    styles: {
      fontSize: 9,
      textColor: [200, 200, 200],
      fillColor: [26, 26, 26],
    },
    headStyles: {
      fillColor: [30, 20, 0],
      textColor: [250, 204, 21],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [20, 20, 20] },
  });

  doc.save(`${tournamentName}-results.pdf`);
}
