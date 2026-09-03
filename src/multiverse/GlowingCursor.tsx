import { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

export default function GlowingCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<TrailPoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      trailsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        life: 1,
      });
      if (trailsRef.current.length > 40) {
        trailsRef.current.shift();
      }

      // Check if hovering interactive element
      const target = e.target as HTMLElement;
      const interactive = target.closest("button, a, input, [data-interactive]");
      setHovering(!!interactive);
    };

    window.addEventListener("mousemove", onMove);

    const animate = () => {
      // Smooth ring follow
      ringPosRef.current.x +=
        (mouseRef.current.x - ringPosRef.current.x) * 0.15;
      ringPosRef.current.y +=
        (mouseRef.current.y - ringPosRef.current.y) * 0.15;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px)`;
      }

      // Draw trails
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const trails = trailsRef.current;
      for (let i = 0; i < trails.length; i++) {
        const p = trails[i];
        p.life -= 0.025;
        if (p.life <= 0) continue;

        const radius = p.life * 6;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grad.addColorStop(0, `rgba(168, 85, 247, ${p.life * 0.6})`);
        grad.addColorStop(0.5, `rgba(6, 182, 212, ${p.life * 0.3})`);
        grad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      trailsRef.current = trails.filter((p) => p.life > 0);

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: "100vw", height: "100vh" }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{ marginLeft: "-4px", marginTop: "-4px" }}
      >
        <div
          className="w-2 h-2 rounded-full transition-all duration-200"
          style={{
            background: "#a855f7",
            boxShadow: "0 0 8px rgba(168, 85, 247, 0.8)",
            transform: hovering ? "scale(0.5)" : "scale(1)",
          }}
        />
      </div>
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{ marginLeft: "-20px", marginTop: "-20px" }}
      >
        <div
          className="rounded-full border transition-all duration-300"
          style={{
            width: hovering ? "56px" : "40px",
            height: hovering ? "56px" : "40px",
            borderColor: hovering
              ? "rgba(217, 70, 239, 0.8)"
              : "rgba(6, 182, 212, 0.5)",
            borderWidth: "1.5px",
            boxShadow: hovering
              ? "0 0 20px rgba(217, 70, 239, 0.4)"
              : "0 0 12px rgba(6, 182, 212, 0.2)",
          }}
        />
      </div>
    </>
  );
}
