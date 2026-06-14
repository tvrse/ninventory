import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { switchAccounts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const accounts = await db.query.switchAccounts.findMany({
    where: eq(switchAccounts.userId, session.user.id),
  })
  return NextResponse.json(accounts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, email, iconColor } = await req.json()
  const [account] = await db
    .insert(switchAccounts)
    .values({ userId: session.user.id, name, email: email ?? null, iconColor: iconColor ?? "#E60012" })
    .returning()
  return NextResponse.json(account, { status: 201 })
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, name, email, iconColor } = await req.json()
  const { and } = await import("drizzle-orm")
  const [updated] = await db
    .update(switchAccounts)
    .set({ name, email: email ?? null, iconColor })
    .where(and(eq(switchAccounts.id, id), eq(switchAccounts.userId, session.user.id)))
    .returning()
  return NextResponse.json(updated)
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  await db.delete(switchAccounts).where(eq(switchAccounts.id, id))
  return NextResponse.json({ ok: true })
}
