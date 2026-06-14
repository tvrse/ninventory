import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q")
  if (!query) return NextResponse.json({ results: [] })

  const apiKey = process.env.RAWG_API_KEY
  // Platform 7 = Nintendo Switch (RAWG doesn't have Switch 2 yet)
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&platforms=7&search_precise=true&page_size=20`
  const res = await fetch(url)
  const data = await res.json()

  // Filter to Switch only, sort newest first so actual Switch releases appear before NSO classics
  const results = (data.results ?? [])
    .filter((g: RawgGame) => g.platforms?.some(p => p.platform.id === 7))
    .sort((a: RawgGame, b: RawgGame) => (b.released ?? "").localeCompare(a.released ?? ""))
    .slice(0, 15)
    .map((g: RawgGame) => ({
      id: g.id,
      title: g.name,
      coverUrl: g.background_image,
      releaseDate: g.released,
      genre: g.genres?.[0]?.name ?? null,
    }))

  return NextResponse.json({ results })
}

interface RawgGame {
  id: number
  name: string
  background_image: string
  released: string
  genres: { name: string }[]
  platforms: { platform: { id: number; name: string } }[]
}
