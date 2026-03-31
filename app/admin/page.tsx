"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, setToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/admin/dashboard");
  }, [token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        router.push("/admin/dashboard");
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-yellow-400/20 shadow-[0_0_40px_rgba(250,204,21,0.1)]">
          <div className="flex flex-col items-center mb-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "Orbitron, sans-serif" }}>
              ADMIN ACCESS
            </h1>
            <p className="text-gray-500 text-sm">BGMI Tournament Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Shield className="w-4 h-4 mr-2" />
              )}
              {loading ? "Authenticating…" : "Login"}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-600 mt-6">
            Configure credentials in <code className="text-yellow-600">.env.local</code>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
