"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { Game, SwitchAccount } from "@/lib/db/schema"

interface Props {
  game: Game & { switchAccount?: SwitchAccount | null }
  accounts: SwitchAccount[]
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function EditGameDialog({ game, accounts, open, onClose, onSaved }: Props) {
  const [format, setFormat] = useState(game.format)
  const [accountId, setAccountId] = useState(game.switchAccountId ?? "")
  const [price, setPrice] = useState(game.purchasePrice != null ? String(game.purchasePrice) : "")
  const [date, setDate] = useState(
    game.purchaseDate ? new Date(game.purchaseDate).toISOString().slice(0, 10) : ""
  )
  const [notes, setNotes] = useState(game.notes ?? "")
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const res = await fetch(`/api/games/${game.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        format,
        switchAccountId: format === "digital" && accountId ? accountId : null,
        purchasePrice: price !== "" ? price : null,
        purchaseDate: date ? new Date(date).toISOString() : null,
        notes: notes.trim() || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      onSaved()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="line-clamp-1">{game.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Format</Label>
            <div className="flex gap-2">
              {["physical", "digital"].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex-1 h-10 rounded-xl font-bold text-sm transition-all border ${
                    format === f
                      ? "text-white border-transparent"
                      : "bg-muted text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                  style={format === f ? { background: "#E60012" } : {}}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Account — only for digital */}
          {format === "digital" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nintendo Account</Label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                <button
                  onClick={() => setAccountId("")}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    accountId === "" ? "text-white border-transparent" : "bg-muted text-muted-foreground border-transparent"
                  }`}
                  style={accountId === "" ? { background: "#E60012" } : {}}
                >
                  No account
                </button>
                {accounts.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAccountId(a.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all border flex items-center gap-2 ${
                      accountId === a.id ? "text-white border-transparent" : "bg-muted text-muted-foreground border-transparent"
                    }`}
                    style={accountId === a.id ? { background: "#E60012" } : {}}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: a.iconColor }}
                    >
                      {a.name.charAt(0).toUpperCase()}
                    </span>
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Purchase Price (฿)</Label>
            <Input
              type="number"
              placeholder="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="bg-muted border-border rounded-xl h-11"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Purchase Date</Label>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-muted border-border rounded-xl h-11"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Any notes..."
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-muted border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-[#E60012]/50"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full h-11 rounded-xl font-bold text-white flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "#E60012" }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
