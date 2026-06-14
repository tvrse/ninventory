import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { games } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await db.delete(games).where(and(eq(games.id, id), eq(games.userId, session.user.id)))
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const [updated] = await db
    .update(games)
    .set(body)
    .where(and(eq(games.id, id), eq(games.userId, session.user.id)))
    .returning()
  return NextResponse.json(updated)
}
