# BGMI Tournament Dashboard

A production-ready, full-stack BGMI (Battlegrounds Mobile India) tournament management system with a broadcast-grade esports UI.

## Features
- Tournament management, team CRUD, dynamic match system
- Real-time leaderboard powered by Socket.IO
- Analytics (bar and line charts via Recharts)
- Export to Excel (ExcelJS) and PDF (jsPDF)
- 3D background grid (Three.js / React Three Fiber), Glassmorphism UI
- JWT admin auth via environment variables

## Tech Stack
Next.js 16 (App Router) · MongoDB/Mongoose · Socket.IO · Tailwind CSS v4 · Framer Motion · Three.js/R3F · Zustand · Zod

## Quick Start

1. **Install:** `npm install`
2. **Configure:** `cp .env.example .env.local` and fill in:
   ```
   MONGODB_URI=mongodb://localhost:27017/bgmi-tournament
   JWT_SECRET=your-secret
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. **Run:** `npm run dev` → http://localhost:3000

## User Flows

**Admin:** `/admin` → login → `/admin/dashboard` → create tournament → manage teams/matches/scores → export

**Public:** `/tournaments` → `/tournament/[id]/live` (real-time leaderboard)

## Scoring Engine

- **Match Score** = (Kills × Kill Points) + Placement Points
- **Placement Points:** linear interpolation — Rank 1 → winnerPoints, Rank N → lastRankPoints
- **Total Score** = sum across all matches

## Deployment

Uses a custom Node.js server (`server.ts`) for Socket.IO. Deploy to Railway, Render, or any VPS.
For serverless (Vercel), Socket.IO real-time features require a separate WebSocket service.
