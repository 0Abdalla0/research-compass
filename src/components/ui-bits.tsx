import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { Member, Priority, PaperStatus } from "@/data/workspace";

export function Initials({
  member,
  size = 32,
  className,
}: {
  member: Member | undefined;
  size?: number;
  className?: string;
}) {
  if (!member) return null;
  return (
    <span
      title={member.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight text-white ring-2 ring-card",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(140deg, oklch(0.6 0.14 ${member.color}), oklch(0.42 0.13 ${member.color}))`,
      }}
    >
      {member.initials}
    </span>
  );
}

export function Stack({ ids, members }: { ids: string[]; members: Member[] }) {
  return (
    <div className="flex -space-x-2">
      {ids.slice(0, 5).map((id) => (
        <Initials key={id} member={members.find((m) => m.id === id)} size={26} />
      ))}
      {ids.length > 5 && (
        <span className="inline-flex h-[26px] items-center justify-center rounded-full bg-muted px-2 text-[11px] font-semibold text-muted-foreground ring-2 ring-card">
          +{ids.length - 5}
        </span>
      )}
    </div>
  );
}

const statusTone: Record<PaperStatus, string> = {
  "To Read": "bg-muted text-muted-foreground",
  Reading: "bg-brand/12 text-brand",
  Analyzing: "bg-warning/18 text-warning-foreground",
  Completed: "bg-success/15 text-success",
  Important: "bg-primary/12 text-primary",
  Rejected: "bg-destructive/12 text-destructive",
};

export function StatusPill({ status }: { status: PaperStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        statusTone[status],
      )}
    >
      {status}
    </span>
  );
}

const prioTone: Record<Priority, string> = {
  LOW: "bg-muted text-muted-foreground",
  MEDIUM: "bg-brand/12 text-brand",
  HIGH: "bg-warning/20 text-warning-foreground",
  URGENT: "bg-destructive/12 text-destructive",
};

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide",
        prioTone[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display truncate text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Panel({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/60 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Meter({ value, tone = "brand" }: { value: number; tone?: "brand" | "success" | "warning" }) {
  const bg = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-brand";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={cn("h-full rounded-full transition-all duration-700", bg)} style={{ width: `${value}%` }} />
    </div>
  );
}