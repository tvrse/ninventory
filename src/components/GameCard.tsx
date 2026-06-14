"use client"
import { Trash2, Package, Download, Pencil } from "lucide-react"
import type { Game, SwitchAccount } from "@/lib/db/schema"
import Image from "next/image"

interface Props {
  game: Game & { switchAccount?: SwitchAccount | null }
  onDelete: (id: string) => void
  onEdit: (game: Game & { switchAccount?: SwitchAccount | null }) => void
}

export function GameCard({ game, onDelete, onEdit }: Props) {
  const isPhysical = game.format === "physical"

  return (
    <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-2xl hover:border-[#E60012]/30 transition-all shadow-sm">
      {/* Cover */}
      <div className="relative flex-shrink-0">
        {game.coverUrl
          ? <Image
              src={game.coverUrl}
              alt={game.title}
              width={72}
              height={72}
              className="w-[72px] h-[72px] object-cover rounded-xl"
              unoptimized
            />
          : <div className="w-[72px] h-[72px] bg-muted rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-muted-foreground" />
            </div>
        }
        {/* Format dot */}
        <div
          className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow-md border-2 border-card"
          style={{ background: isPhysical ? "#E60012" : "#0070CC" }}
        >
          {isPhysical
            ? <Package className="w-3 h-3 text-white" />
            : <Download className="w-3 h-3 text-white" />
          }
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground leading-tight line-clamp-2">{game.title}</p>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {game.switchAccount && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: game.switchAccount.iconColor }} />
              {game.switchAccount.name}
            </span>
          )}
          {game.genre && (
            <span className="text-xs text-muted-foreground">
              {game.switchAccount ? "· " : ""}{game.genre}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {game.purchasePrice != null ? (
              <span className="text-sm font-extrabold" style={{ color: "#E60012" }}>
                ฿{Number(game.purchasePrice).toLocaleString()}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">No price</span>
            )}
            {game.purchaseDate && (
              <span className="text-xs text-muted-foreground">
                {new Date(game.purchaseDate).toLocaleDateString("en-GB", { year: "2-digit", month: "short", day: "numeric" })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(game)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(game.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
