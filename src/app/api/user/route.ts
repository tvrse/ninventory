import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, currentPassword, newPassword } = await req.json()

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const updates: Record<string, string> = {}

  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    updates.name = name.trim()
  }

  if (newPassword !== undefined) {
    if (!currentPassword) return NextResponse.json({ error: "Current password required" }, { status: 400 })
    if (newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash!)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    updates.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

  const [updated] = await db.update(users).set(updates).where(eq(users.id, session.user.id)).returning()
  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db.delete(users).where(eq(users.id, session.user.id))
  return NextResponse.json({ ok: true })
}
