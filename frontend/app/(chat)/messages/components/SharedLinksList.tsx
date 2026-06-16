"use client"

import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { SharedLink } from "@/app/(chat)/messages/utils/types";

interface SharedLinksListProps {
  readonly links: SharedLink[]
}

export function SharedLinksList({ links }: SharedLinksListProps) {
  if (links.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">Chưa có liên kết nào</div>
    )
  }

  return (
    <div className="space-y-2">
      {links.map((link) => (
        <Card key={link.id} className="group py-0!">
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 hover:bg-accent/50 transition-colors rounded-lg"
          >
            <div className="flex-shrink-0 mt-0.5">
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1 text-balance">{link.title}</p>
              <p className="text-xs text-muted-foreground truncate">{link.url}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </Card>
      ))}
    </div>
  )
}
