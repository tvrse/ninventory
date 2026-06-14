"use client"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Loader2, Package, Download, Check } from "lucide-react"
import type { SwitchAccount } from "@/lib/db/schema"
import Image from "next/image"

interface SearchResult {
  id: number
  title: string
  coverUrl: string
  releaseDate: string
  genre: string
}

interface Props {
  accounts: SwitchAccount[]
  onAdded: () => void
}

export function AddGameDialog({ accounts, onAdded }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<SearchResult | null>(null)
  const [format, setFormat] = useState("physical")
  const [accountId, setAccountId] = useState("")
  const [price, setPrice] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results)
      setSearching(false)
    }, 400)
  }, [query])

  function reset() {
    setQuery(""); setResults([]); setSelected(null)
    setFormat("physical"); setAccountId(""); setPrice(""); setPurchaseDate("")
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selected.title,
        coverUrl: selected.coverUrl,
        genre: selected.genre,
        releaseDate: selected.releaseDate,
        format,
        switchAccountId: format === "digital" && accountId ? accountId : null,
        purchasePrice: price ? parseFloat(price) : null,
        purchaseDate: purchaseDate || null,
      }),
    })
    setSaving(false)
    setOpen(false)
    reset()
    onAdded()
  }

  return (
    <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 h-10 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity flex-shrink-0" style={{ background: "#E60012" }}>
        <Plus className="w-4 h-4" /> Add Game
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Game</DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search Nintendo Switch games…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>
            {searching && <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5" /></div>}
            <div className="space-y-1">
              {results.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted text-left transition-colors"
                >
                  {r.coverUrl
                    ? <Image src={r.coverUrl} alt={r.title} width={48} height={48} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" unoptimized />
                    : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🎮</div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{r.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.releaseDate}{r.genre ? ` · ${r.genre}` : ""}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected game */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
              {selected.coverUrl
                ? <Image src={selected.coverUrl} alt={selected.title} width={56} height={56} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" unoptimized />
                : <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">🎮</div>
              }
              <div>
                <p className="font-bold text-sm">{selected.title}</p>
                <p className="text-xs text-gray-400">{selected.releaseDate}</p>
              </div>
            </div>

            {/* Format toggle */}
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "physical", label: "Physical", icon: Package, color: "#E60012" },
                  { value: "digital", label: "Digital", icon: Download, color: "#0070CC" },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => { setFormat(f.value); setAccountId("") }}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                      format === f.value ? "text-white" : "border-gray-200 text-gray-400 bg-white"
                    }`}
                    style={format === f.value ? { background: f.color, borderColor: f.color } : {}}
                  >
                    <f.icon className="w-4 h-4" />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nintendo Account picker */}
            {format === "digital" && accounts.length > 0 && (
              <div className="space-y-2">
                <Label>Nintendo Account</Label>
                <div className="space-y-2">
                  {accounts.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAccountId(a.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        accountId === a.id ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: a.iconColor }}>
                        {a.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{a.name}</p>
                        {a.email && <p className="text-xs text-gray-400 truncate">{a.email}</p>}
                      </div>
                      {accountId === a.id && <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Purchase Price (฿)</Label>
                <Input type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Purchase Date</Label>
                <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setSelected(null)}>Back</Button>
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Game"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
