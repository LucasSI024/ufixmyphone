/**
 * Rustgevende, langzaam bewegende achtergrond.
 * - Zachte aurora-blobs in primary/mint tinten
 * - Heel langzame drift, geen interactie
 * - Respecteert prefers-reduced-motion (stilstaand)
 */
export function CalmBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Basis wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      {/* Aurora blobs */}
      <div className="absolute -top-32 -left-32 h-[60vmax] w-[60vmax] rounded-full bg-primary/20 blur-3xl animate-calm-drift-1 motion-reduce:animate-none" />
      <div className="absolute top-1/3 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-emerald-400/15 blur-3xl animate-calm-drift-2 motion-reduce:animate-none" />
      <div className="absolute -bottom-40 left-1/4 h-[50vmax] w-[50vmax] rounded-full bg-sky-400/15 blur-3xl animate-calm-drift-3 motion-reduce:animate-none" />
      <div className="absolute top-1/2 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl animate-calm-pulse motion-reduce:animate-none" />

      {/* Subtiele korrel voor diepte */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />
    </div>
  );
}
