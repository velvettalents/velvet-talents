import type { Availability } from "@/lib/catalog";

const styles: Record<Availability, string> = {
  available: "border-emerald-700/30 bg-emerald-50 text-emerald-800",
  onRequest: "border-sand/50 bg-sand-soft/50 text-ink",
  soldOut: "border-line bg-muted text-ink-muted",
};

export function AvailabilityBadge({ availability, label }: { availability: Availability; label: string }) {
  return (
    <p className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs tracking-wide uppercase ${styles[availability]}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </p>
  );
}
