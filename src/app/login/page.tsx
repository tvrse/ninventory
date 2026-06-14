"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Gamepad2, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error)
        setLoading(false)
        return
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
      return
    }
    router.push("/")
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "#111111" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl"
            style={{ background: "#E60012" }}
          >
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Ninventory</h1>
          <p className="text-white/50 text-sm mt-1">
            {mode === "login" ? "Sign in to your collection" : "Create your account"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1c1c1e] rounded-3xl p-6 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">Name</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-[#2c2c2e] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="bg-[#2c2c2e] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-[#2c2c2e] border-white/10 text-white placeholder:text-white/30 rounded-xl h-11"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 mt-2"
              style={{ background: "#E60012" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "login" ? "Sign In" : "Create Account"}
            </button>

            <p className="text-center text-sm text-white/40">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="text-white/80 font-bold hover:text-white transition-colors"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}
              >
                {mode === "login" ? "Register" : "Sign In"}
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
