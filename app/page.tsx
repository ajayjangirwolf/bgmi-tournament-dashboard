import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-yellow-900/10 via-transparent to-transparent" />

      {/* Grid overlay */}
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

      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8">
        {/* Logo/Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-1.5 text-sm text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            BGMI Tournament System v1.0
          </div>

          <h1
            className="text-5xl md:text-7xl font-black tracking-tight"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            <span className="text-white">BGMI</span>{" "}
            <span
              className="text-yellow-400"
              style={{
                textShadow:
                  "0 0 20px rgba(250,204,21,0.8), 0 0 40px rgba(250,204,21,0.4)",
              }}
            >
              DASHBOARD
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Professional esports tournament management with real-time leaderboards,
            analytics, and broadcast-grade UI.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-yellow-400 text-black font-bold hover:bg-yellow-300 transition-all duration-200 shadow-[0_0_25px_rgba(250,204,21,0.4)] hover:shadow-[0_0_35px_rgba(250,204,21,0.6)]"
          >
            ⚡ Admin Panel
          </Link>
          <Link
            href="/tournaments"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl border border-yellow-400/50 text-yellow-400 font-bold hover:bg-yellow-400/10 transition-all duration-200"
          >
            🏆 View Tournaments
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { icon: "⚡", label: "Real-time Sync" },
            { icon: "🏆", label: "Live Leaderboard" },
            { icon: "📊", label: "Analytics" },
            { icon: "📤", label: "Excel & PDF Export" },
          ].map((f) => (
            <div
              key={f.label}
              className="glass rounded-xl p-4 text-center hover:border-yellow-400/30 transition-colors"
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-sm text-gray-400">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

