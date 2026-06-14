"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AddGameDialog } from "@/components/AddGameDialog"
import { EditGameDialog } from "@/components/EditGameDialog"
import { GameCard } from "@/components/GameCard"
import { Input } from "@/components/ui/input"
import { Search, Gamepad2, Package, Download, Wallet, Menu } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import { Sidebar } from "@/components/Sidebar"
import type { Game, SwitchAccount } from "@/lib/db/schema"

type GameWithAccount = Game & { switchAccount?: SwitchAccount | null }

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [games, setGames] = useState<GameWithAccount[]>([])
  const [accounts, setAccounts] = useState<SwitchAccount[]>([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [editingGame, setEditingGame] = useState<GameWithAccount | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  async function loadGames() {
    const res = await fetch("/api/games")
    if (res.ok) setGames(await res.json())
  }

  async function loadAccounts() {
    const res = await fetch("/api/accounts")
    if (res.ok) setAccounts(await res.json())
  }

  useEffect(() => {
    if (status === "authenticated") { loadGames(); loadAccounts() }
  }, [status])

  async function deleteGame(id: string) {
    await fetch(`/api/games/${id}`, { method: "DELETE" })
    setGames(g => g.filter(x => x.id !== id))
  }

  if (status === "loading" || status === "unauthenticated") return null

  const filtered = games.filter(g => {
    if (search && !g.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === "physical") return g.format === "physical"
    if (filter === "digital") return g.format === "digital"
    if (filter.startsWith("account:")) return g.switchAccountId === filter.slice(8)
    return true
  })

  const totalSpent = games.reduce((sum, g) => sum + (g.purchasePrice ? Number(g.purchasePrice) : 0), 0)
  const physicalSpent = games.filter(g => g.format === "physical").reduce((sum, g) => sum + (g.purchasePrice ? Number(g.purchasePrice) : 0), 0)
  const digitalSpent = games.filter(g => g.format === "digital").reduce((sum, g) => sum + (g.purchasePrice ? Number(g.purchasePrice) : 0), 0)
  const physicalCount = games.filter(g => g.format === "physical").length
  const digitalCount = games.filter(g => g.format === "digital").length
  const accountStats = accounts.map(a => ({
    ...a,
    count: games.filter(g => g.switchAccountId === a.id).length,
    spent: games.filter(g => g.switchAccountId === a.id).reduce((sum, g) => sum + (g.purchasePrice ? Number(g.purchasePrice) : 0), 0),
  }))

  const filterTabs = [
    { value: "all", label: "All" },
    { value: "physical", label: "Physical" },
    { value: "digital", label: "Digital" },
    ...accounts.map(a => ({ value: `account:${a.id}`, label: a.name, color: a.iconColor })),
  ]

  return (
    <div className="min-h-screen bg-background">
      {editingGame && (
        <EditGameDialog
          game={editingGame}
          accounts={accounts}
          open={!!editingGame}
          onClose={() => setEditingGame(null)}
          onSaved={() => { loadGames(); setFilter("all") }}
        />
      )}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        accounts={accounts}
        onAccountsChanged={loadAccounts}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#E60012] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-white" />
            <span className="font-extrabold text-white text-base tracking-wide">Ninventory</span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Hero — Total Spent */}
        <div
          className="rounded-2xl p-5 text-white shadow-xl"
          style={{ background: "linear-gradient(160deg, #1c1c1e 0%, #2c2c2e 100%)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Total Spent</span>
          </div>
          <p className="text-5xl font-extrabold tracking-tight">
            ฿{totalSpent.toLocaleString()}
          </p>
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <Package className="w-3.5 h-3.5 text-white/50" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Physical</p>
                <p className="text-white font-bold text-sm">฿{physicalSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                <Download className="w-3.5 h-3.5 text-white/50" />
              </div>
              <div>
                <p className="text-white/40 text-xs">Digital</p>
                <p className="text-white font-bold text-sm">฿{digitalSpent.toLocaleString()}</p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <p className="text-white/40 text-xs">Collection</p>
              <p className="text-white font-bold text-sm">{games.length} game{games.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-border">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-muted">
              <Package className="w-5 h-5" style={{ color: "#E60012" }} />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{physicalCount}</p>
              <p className="text-xs text-muted-foreground font-semibold">Physical</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-sm flex items-center gap-3 border border-border">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-muted">
              <Download className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">{digitalCount}</p>
              <p className="text-xs text-muted-foreground font-semibold">Digital</p>
            </div>
          </div>
        </div>

        {/* Per-account spending — horizontal scroll chips */}
        {accountStats.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">By Account</p>
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              {accountStats.map(a => (
                <div
                  key={a.id}
                  className="flex-shrink-0 bg-card rounded-2xl px-4 py-3 shadow-sm border border-border flex items-center gap-2.5 min-w-[160px] max-w-[200px]"
                >
                  <span
                    className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-extrabold text-sm"
                    style={{ background: a.iconColor }}
                  >
                    {a.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{a.name}</p>
                    <p className="font-extrabold text-sm" style={{ color: "#E60012" }}>฿{a.spent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{a.count} game{a.count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Add */}
        <div className="flex gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-card border-border rounded-xl h-11 text-foreground placeholder:text-muted-foreground"
              placeholder="Search your games…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <AddGameDialog accounts={accounts} onAdded={loadGames} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filterTabs.map(f => {
            const active = filter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  active
                    ? "text-white border-transparent shadow-md"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
                style={active ? { background: "#E60012", borderColor: "#E60012" } : {}}
              >
                {"color" in f && (
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: f.color as string }} />
                )}
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Game List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-9 h-9 text-muted-foreground" />
            </div>
            <p className="font-bold text-foreground">No games found</p>
            <p className="text-sm text-muted-foreground mt-1">Tap &quot;Add Game&quot; to start your collection</p>
          </div>
        ) : (
          <div className="space-y-2.5 pb-6">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
              {filtered.length} game{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.map(g => <GameCard key={g.id} game={g} onDelete={deleteGame} onEdit={setEditingGame} />)}
          </div>
        )}
      </main>
    </div>
  )
}
