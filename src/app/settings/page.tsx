"use client"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, User, Lock, Trash2, Loader2, Check } from "lucide-react"
import Link from "next/link"

interface SectionProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const [name, setName] = useState(session?.user?.name ?? "")
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  async function saveName() {
    setNameError(""); setNameSuccess(false); setNameLoading(true)
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    setNameLoading(false)
    if (!res.ok) { setNameError(data.error); return }
    await update({ name: data.name })
    setNameSuccess(true)
    setTimeout(() => setNameSuccess(false), 3000)
  }

  async function changePassword() {
    setPasswordError(""); setPasswordSuccess(false)
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match"); return }
    setPasswordLoading(true)
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    setPasswordLoading(false)
    if (!res.ok) { setPasswordError(data.error); return }
    setPasswordSuccess(true)
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") { setDeleteError('Type DELETE to confirm'); return }
    setDeleteLoading(true)
    await fetch("/api/user", { method: "DELETE" })
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#E60012] shadow-lg">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-bold text-white text-base">Settings</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Account info */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0" style={{ background: "#E60012" }}>
            {(session?.user?.name ?? session?.user?.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground">{session?.user?.name ?? "—"}</p>
            <p className="text-sm text-muted-foreground truncate">{session?.user?.email}</p>
          </div>
        </div>

        {/* Change name */}
        <Section icon={<User className="w-4 h-4" />} title="Display Name" description="Change how your name appears">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-muted border-border rounded-xl h-11"
                placeholder="Your name"
              />
            </div>
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            {nameSuccess && <p className="text-sm text-green-500 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Name updated</p>}
            <button
              onClick={saveName}
              disabled={nameLoading || !name.trim()}
              className="w-full h-11 rounded-xl font-bold text-white flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#E60012" }}
            >
              {nameLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Name"}
            </button>
          </div>
        </Section>

        {/* Change password */}
        <Section icon={<Lock className="w-4 h-4" />} title="Password" description="Update your login password">
          <div className="space-y-3">
            {[
              { label: "Current Password", value: currentPassword, set: setCurrentPassword },
              { label: "New Password", value: newPassword, set: setNewPassword },
              { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword },
            ].map(f => (
              <div key={f.label} className="space-y-1.5">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{f.label}</Label>
                <Input
                  type="password"
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className="bg-muted border-border rounded-xl h-11"
                  placeholder="••••••••"
                />
              </div>
            ))}
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-500 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Password changed</p>}
            <button
              onClick={changePassword}
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full h-11 rounded-xl font-bold text-white flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#E60012" }}
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Change Password"}
            </button>
          </div>
        </Section>

        {/* Delete account */}
        <Section icon={<Trash2 className="w-4 h-4" />} title="Delete Account" description="Permanently delete your account and all data">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This will delete your account, all your games, and Switch accounts. This cannot be undone.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Type DELETE to confirm
              </Label>
              <Input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                className="bg-muted border-border rounded-xl h-11"
                placeholder="DELETE"
              />
            </div>
            {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
            <button
              onClick={deleteAccount}
              disabled={deleteLoading || deleteConfirm !== "DELETE"}
              className="w-full h-11 rounded-xl font-bold text-white flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50 bg-red-600"
            >
              {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete My Account"}
            </button>
          </div>
        </Section>
      </main>
    </div>
  )
}
