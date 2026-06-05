import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport canvas met een tech/digitaal thema:
 * - Drijvende nodes (deeltjes) die onderling lijnen tekenen
 * - Lijnen lichten op naar de cursor toe
 * - Subtiele gloed in primary-kleur
 *
 * Pointer-events: none — interactie op de pagina blijft normaal.
 */
export function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number };
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    function resolvePrimaryRGB(): [number, number, number] {
      // Lees de berekende primary-kleur via een tijdelijk element en converteer naar rgb
      const probe = document.createElement("span");
      probe.style.color = "hsl(var(--primary))";
      probe.style.display = "none";
      document.body.appendChild(probe);
      const computed = getComputedStyle(probe).color;
      document.body.removeChild(probe);
      const m = computed.match(/\d+(\.\d+)?/g);
      if (m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])];
      return [99, 102, 241]; // fallback indigo
    }
    let [pr, pg, pb] = resolvePrimaryRGB();

    function resize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(90, Math.floor((width * height) / 22000));
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    }

    let raf = 0;
    function tick() {
      ctx!.clearRect(0, 0, width, height);

      // Subtiel grid
      ctx!.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, 0.05)`;
      ctx!.lineWidth = 1;
      const grid = 56;
      const offset = reduceMotion ? 0 : (performance.now() / 120) % grid;
      ctx!.beginPath();
      for (let x = -offset; x < width; x += grid) {
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, height);
      }
      for (let y = -offset; y < height; y += grid) {
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
      }
      ctx!.stroke();

      // Update + teken nodes
      for (const n of nodes) {
        if (!reduceMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }

        // Aantrekking richting cursor
        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const force = (180 - dist) / 180 * 0.6;
            n.x += (dx / dist) * force;
            n.y += (dy / dist) * force;
          }
        }
      }

      // Lijnen tussen nabije nodes
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < 140) {
            const alpha = (1 - d / 140) * 0.22;
            ctx!.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }

        // Lijn naar cursor
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 200) {
            const alpha = (1 - d / 200) * 0.55;
            ctx!.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }

        // Node-puntje
        ctx!.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.55)`;
        ctx!.beginPath();
        ctx!.arc(a.x, a.y, 1.4, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Gloed rond cursor
      if (mouse.active) {
        const grad = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        grad.addColorStop(0, `rgba(${pr}, ${pg}, ${pb}, 0.18)`);
        grad.addColorStop(1, `rgba(${pr}, ${pg}, ${pb}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(mouse.x, mouse.y, 160, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
