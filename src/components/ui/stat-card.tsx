import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

type StatTone = "default" | "primary" | "success" | "warning" | "info" | "danger"

interface StatCardProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  tone?: StatTone
  className?: string
}

const toneStyles: Record<StatTone, { iconWrap: string; icon: string; accent: string }> = {
  default: {
    iconWrap: "bg-muted text-muted-foreground ring-border",
    icon: "",
    accent: "before:bg-border",
  },
  primary: {
    iconWrap: "bg-primary/10 text-primary ring-primary/20",
    icon: "",
    accent: "before:bg-primary/60",
  },
  success: {
    iconWrap: "bg-success/10 text-success ring-success/20",
    icon: "",
    accent: "before:bg-success/60",
  },
  warning: {
    iconWrap: "bg-warning/15 text-warning-foreground ring-warning/30",
    icon: "",
    accent: "before:bg-warning/70",
  },
  info: {
    iconWrap: "bg-info/10 text-info ring-info/20",
    icon: "",
    accent: "before:bg-info/60",
  },
  danger: {
    iconWrap: "bg-destructive/10 text-destructive ring-destructive/20",
    icon: "",
    accent: "before:bg-destructive/60",
  },
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  className,
}: StatCardProps) {
  const styles = toneStyles[tone]
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow hover:shadow-sm",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
        styles.accent,
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 py-5">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <div className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </div>
          {hint && (
            <div className="text-xs text-muted-foreground">{hint}</div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1",
              styles.iconWrap,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
