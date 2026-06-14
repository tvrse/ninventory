import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { email, password, name } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const [user] = await db.insert(users).values({ email, name, passwordHash }).returning()
  return NextResponse.json({ id: user.id, email: user.email })
}
