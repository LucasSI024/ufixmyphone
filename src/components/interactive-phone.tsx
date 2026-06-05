import { useRef, useState, type PointerEvent } from "react";
import { Battery, Shield, CheckCircle2, Sparkles, Check } from "lucide-react";

/**
 * Interactieve telefoonmockup met 3D-tilt op cursor en een klik-puls.
 * Past zich aan reduced-motion aan via CSS-animaties die al in styles.css staan.
 */
export function InteractivePhone() {
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pulse, setPulse] = useState(0);

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    const phone = phoneRef.current;
    if (!stage || !phone) return;
    const rect = stage.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotY = px * 22;
    const rotX = -py * 18;
    phone.style.setProperty("--rx", `${rotX}deg`);
    phone.style.setProperty("--ry", `${rotY}deg`);
    phone.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    phone.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
  }

  function handleLeave() {
    const phone = phoneRef.current;
    if (!phone) return;
    setHovered(false);
    phone.style.setProperty("--rx", "0deg");
    phone.style.setProperty("--ry", "0deg");
  }

  function handleClick() {
    setPulse((n) => n + 1);
  }

  return (
    <div
      ref={stageRef}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handleLeave}
      onClick={handleClick}
      className="relative mx-auto flex aspect-square w-full max-w-[440px] cursor-pointer items-center justify-center select-none"
      style={{ perspective: "1100px" }}
    >
      {/* Orbiting rings */}
      <div aria-hidden className="absolute inset-0 grid place-items-center">
        <div className="absolute h-[92%] w-[92%] rounded-full border border-primary/20 animate-hero-spin" />
        <div className="absolute h-[72%] w-[72%] rounded-full border border-accent/30 animate-hero-spin-rev" />
        <div
          className="absolute h-[54%] w-[54%] rounded-full border border-primary/15 animate-hero-spin"
          style={{ animationDuration: "16s" }}
        />
      </div>

      {/* Klik-puls */}
      {pulse > 0 && (
        <span
          key={pulse}
          aria-hidden
          className="pointer-events-none absolute h-[60%] w-[60%] rounded-full border border-primary/50"
          style={{ animation: "hero-click-pulse 0.7s ease-out forwards" }}
        />
      )}

      {/* Floating chips — reageren licht op hover */}
      <Chip className="left-0 top-[8%]" delay="0s" hovered={hovered} dx={-8} dy={-6}>
        <Battery className="h-3.5 w-3.5 text-primary" /> Batterij 92%
      </Chip>
      <Chip className="right-0 top-[14%]" delay="0.8s" hovered={hovered} dx={10} dy={-4}>
        <Shield className="h-3.5 w-3.5 text-primary" /> Veilige uitbetaling
      </Chip>
      <Chip className="bottom-[14%] left-[4%]" delay="0.4s" hovered={hovered} dx={-10} dy={8}>
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Conditie: goed
      </Chip>
      <Chip className="bottom-[8%] right-[2%]" delay="1.1s" hovered={hovered} dx={8} dy={10}>
        <Sparkles className="h-3.5 w-3.5 text-primary" /> 4 kopers actief
      </Chip>

      {/* Phone */}
      <div
        ref={phoneRef}
        className="relative z-[5] aspect-[9/19] w-[56%] max-w-[220px] rounded-[2.25rem] bg-gradient-to-b from-foreground to-foreground/80 p-2 shadow-2xl transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform:
            "perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--ps, 1))",
          ["--ps" as never]: hovered ? "1.04" : "1",
          animation: hovered ? "none" : "hero-float-phone 6s ease-in-out infinite",
        }}
      >
        <div className="absolute inset-0 rounded-[2.25rem] ring-1 ring-inset ring-white/10" />
        {/* Cursor-glare */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[2.25rem] opacity-0 transition-opacity duration-200"
          style={{
            opacity: hovered ? 1 : 0,
            background:
              "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.35), transparent 45%)",
          }}
        />
        <div className="mx-auto h-5 w-[38%] rounded-b-2xl bg-background/90" />
        <div className="relative mt-1 h-[calc(100%-1.5rem)] overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-primary/30 via-background to-background">
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-hero-shine" />
          <div className="relative flex h-full flex-col gap-2 p-3">
            <span className="self-start rounded-full bg-background/80 px-2 py-1 text-[10px] font-semibold text-foreground">
              Jouw iPhone
            </span>
            <div className="rounded-xl border border-border/40 bg-background/70 p-2.5 backdrop-blur">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Indicatie</div>
              <div className="font-display text-2xl font-bold text-foreground">€ 412</div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-mint animate-hero-progress" />
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-background/70 p-2.5 text-[11px] text-foreground/80 backdrop-blur">
              <div className="flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> 128 GB</div>
              <div className="mt-1 flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> Geen iCloud-lock</div>
              <div className="mt-1 flex items-center gap-1.5"><Check className="h-3 w-3 text-primary" /> Scherm gaaf</div>
            </div>
            <div
              className="mt-auto rounded-xl bg-primary px-2.5 py-2 text-center text-[11px] font-semibold text-primary-foreground transition-transform"
              style={{ transform: hovered ? "translateY(-2px)" : "translateY(0)" }}
            >
              Plaats op marktplaats
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  children,
  className,
  delay,
  hovered,
  dx,
  dy,
}: {
  children: React.ReactNode;
  className: string;
  delay: string;
  hovered: boolean;
  dx: number;
  dy: number;
}) {
  return (
    <div
      className={
        "absolute z-10 rounded-2xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-semibold shadow-card backdrop-blur animate-hero-bob transition-transform duration-300 " +
        className
      }
      style={{
        animationDelay: delay,
        transform: hovered ? `translate(${dx}px, ${dy}px)` : "translate(0,0)",
      }}
    >
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
