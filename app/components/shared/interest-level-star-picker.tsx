"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { StarIcon } from "lucide-react"

import type { InterestLevel } from "~/lib/labels"
import { cn } from "~/lib/utils"
import { pagesI18nNs } from "~/lib/i18n/config"

type InterestLevelStarPickerProps = {
  value: InterestLevel
  onChange: (next: InterestLevel) => void
  showValueLabel?: boolean
  size?: "sm" | "md"
}

/**
 * One-row star rating for InterestLevel (0..5).
 */
export function InterestLevelStarPicker({
  value,
  onChange,
  showValueLabel = true,
  size = "md",
}: InterestLevelStarPickerProps) {
  const { t } = useTranslation(pagesI18nNs)
  const [hoverStars, setHoverStars] = React.useState<number | null>(null)
  const previewStars = hoverStars ?? value

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-border",
          size === "sm" ? "px-1.5 py-1" : "px-2 py-1.5"
        )}
        onMouseLeave={() => setHoverStars(null)}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1
          return (
            <button
              key={starValue}
              type="button"
              onMouseEnter={() => setHoverStars(starValue)}
              onFocus={() => setHoverStars(starValue)}
              onClick={() => onChange(starValue as InterestLevel)}
              className={cn("rounded-sm", size === "sm" ? "p-0.5" : "p-0.5")}
              aria-label={t("shared.star_interest_aria", { stars: starValue })}
            >
              <StarIcon
                className={cn(
                  size === "sm"
                    ? "size-3.5 transition-colors"
                    : "size-5 transition-colors",
                  starValue <= previewStars
                    ? "fill-current text-amber-500"
                    : "text-muted-foreground/35"
                )}
              />
            </button>
          )
        })}
      </div>
      {showValueLabel ? (
        <span className="text-xs text-muted-foreground tabular-nums">
          {value}/5
        </span>
      ) : null}
    </div>
  )
}
