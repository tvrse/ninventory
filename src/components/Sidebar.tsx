"use client"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "@/components/ThemeProvider"
import { ManageAccountsDialog } from "@/components/ManageAccountsDialog"
import { X, Sun, Moon, LogOut, UserCog, Gamepad2 } from "lucide-react"
import Link from "next/link"
import type { SwitchAccount } from "@/lib/db/schema"

interface Props {
  open: boolean
  onClose: () => void
  accounts: SwitchAccount[]
  onAccountsChanged: () => void
}

export function Sidebar({ open, onClose, accounts, onAccountsChanged }: Props) {
  const { data: session } = useSession()
  const { theme, toggle } = useTheme()

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-40 flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ background: "#E60012" }}>
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-white" />
            <span className="font-extrabold text-white text-base tracking-wide">Ninventory</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User profile */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0"
              style={{ background: "#E60012" }}
            >
              {(session?.user?.name ?? session?.user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-foreground truncate">{session?.user?.name ?? "—"}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Manage Switch Accounts */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors font-semibold text-sm text-foreground cursor-pointer">
            <Gamepad2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <ManageAccountsDialog
              accounts={accounts}
              onChanged={() => { onAccountsChanged(); }}
              trigger={<span>Switch Accounts</span>}
            />
          </div>

          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors font-semibold text-sm"
          >
            <UserCog className="w-4 h-4 text-muted-foreground" />
            Settings
          </Link>
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors font-semibold text-sm"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors font-semibold text-sm text-red-500"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  )
}
