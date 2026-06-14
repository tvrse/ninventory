import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { games } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const list = await db.query.games.findMany({
    where: eq(games.userId, session.user.id),
    orderBy: [desc(games.createdAt)],
    with: { switchAccount: true },
  })
  return NextResponse.json(list)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const [game] = await db.insert(games).values({
    userId: session.user.id,
    title: body.title,
    coverUrl: body.coverUrl ?? null,
    genre: body.genre ?? null,
    developer: body.developer ?? null,
    releaseDate: body.releaseDate ?? null,
    format: body.format,
    switchAccountId: body.switchAccountId ?? null,
    purchasePrice: body.purchasePrice ?? null,
    purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
    notes: body.notes ?? null,
  }).returning()
  return NextResponse.json(game, { status: 201 })
}
