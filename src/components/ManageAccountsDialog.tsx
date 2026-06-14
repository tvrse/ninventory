"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Trash2, Pencil, Check, X } from "lucide-react"
import type { SwitchAccount } from "@/lib/db/schema"

const COLORS = ["#E60012", "#0070CC", "#1DB954", "#FF9500", "#9B59B6", "#E67E22", "#2ECC71", "#E91E8C"]

interface Props {
  accounts: SwitchAccount[]
  onChanged: () => void
  trigger?: React.ReactNode
}

interface EditState {
  id: string
  name: string
  email: string
  iconColor: string
}

export function ManageAccountsDialog({ accounts, onChanged, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  function startEdit(a: SwitchAccount) {
    setEditing({ id: a.id, name: a.name, email: a.email ?? "", iconColor: a.iconColor })
  }

  async function saveEdit() {
    if (!editing || !editing.name.trim()) return
    setEditSaving(true)
    await fetch("/api/accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing.id,
        name: editing.name.trim(),
        email: editing.email.trim() || null,
        iconColor: editing.iconColor,
      }),
    })
    setEditSaving(false)
    setEditing(null)
    onChanged()
  }

  async function addAccount() {
    if (!name.trim()) return
    setSaving(true)
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: email.trim() || null, iconColor: color }),
    })
    setSaving(false)
    setName("")
    setEmail("")
    setColor(COLORS[0])
    onChanged()
  }

  async function deleteAccount(id: string) {
    await fetch("/api/accounts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (editing?.id === id) setEditing(null)
    onChanged()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={trigger ? "w-full text-left" : "p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"}>
        {trigger ?? <Settings className="w-4 h-4" />}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nintendo Switch Accounts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Account list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {accounts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No accounts yet.</p>
            )}
            {accounts.map(a => (
              <div key={a.id}>
                {editing?.id === a.id ? (
                  /* Inline edit form */
                  <div className="p-3 bg-muted rounded-xl space-y-2">
                    <Input
                      value={editing.name}
                      onChange={e => setEditing(s => s && ({ ...s, name: e.target.value }))}
                      placeholder="Name"
                      className="h-9 bg-card border-border rounded-lg text-sm"
                    />
                    <Input
                      type="email"
                      value={editing.email}
                      onChange={e => setEditing(s => s && ({ ...s, email: e.target.value }))}
                      placeholder="Nintendo email (optional)"
                      className="h-9 bg-card border-border rounded-lg text-sm"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          className={`w-6 h-6 rounded-full transition-transform flex-shrink-0 ${editing.iconColor === c ? "ring-2 ring-offset-1 ring-foreground scale-110" : ""}`}
                          style={{ background: c }}
                          onClick={() => setEditing(s => s && ({ ...s, iconColor: c }))}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        disabled={editSaving || !editing.name.trim()}
                        className="flex-1 h-8 rounded-lg text-xs font-bold text-white flex items-center justify-center disabled:opacity-50"
                        style={{ background: "#E60012" }}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="h-8 px-3 rounded-lg text-xs font-bold bg-card border border-border text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal row */
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                    <span
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: a.iconColor }}
                    >
                      {a.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{a.name}</p>
                      {a.email && <p className="text-xs text-muted-foreground truncate">{a.email}</p>}
                    </div>
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-colors flex-shrink-0"
                      onClick={() => startEdit(a)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      onClick={() => deleteAccount(a.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add form */}
          <div className="border-t pt-4 space-y-3" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm font-semibold">Add Account</p>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input placeholder="e.g. My Account" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Nintendo Email <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input type="email" placeholder="user@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`w-7 h-7 rounded-full transition-transform flex-shrink-0 ${color === c ? "ring-2 ring-offset-2 ring-gray-800 scale-110" : ""}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <Button
              className="w-full text-white font-semibold"
              style={{ background: "#E60012" }}
              onClick={addAccount}
              disabled={saving || !name.trim()}
            >
              Add Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
