import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Radio, Waves } from "lucide-react";

interface Props {
  depth: number;
  resonance: number;
}

export default function HudBar({ depth, resonance }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Procedural audio-wave visualizer (no audio file needed)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const bars = 32;

    const draw = () => {
      t += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const barW = w / bars;

      for (let i = 0; i < bars; i++) {
        const freq = i / bars;
        const wave =
          Math.sin(t * 2 + freq * 8) * 0.3 +
          Math.sin(t * 5 + freq * 12) * 0.2 +
          Math.sin(t * 0.5 + freq * 3) * 0.15 +
          0.5;
        const barH = wave * h * 0.8;
        const x = i * barW;
        const y = (h - barH) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, "rgba(6, 182, 212, 0.9)");
        grad.addColorStop(0.5, "rgba(168, 85, 247, 0.9)");
        grad.addColorStop(1, "rgba(217, 70, 239, 0.7)");
        ctx.fillStyle = grad;
        ctx.fillRect(x + barW * 0.15, y, barW * 0.7, barH);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
      style={{
        background:
          "linear-gradient(180deg, rgba(3,0,20,0.85) 0%, rgba(3,0,20,0.4) 70%, transparent 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(168, 85, 247, 0.15)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #a855f7, #6366f1 50%, #030014)",
            boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)",
          }}
        />
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm font-bold tracking-[0.2em] text-white/90 uppercase">
            Blueberry
          </span>
          <span className="text-[10px] sm:text-xs tracking-[0.3em] text-cyan-400/70 uppercase">
            Multiverse
          </span>
        </div>
      </div>

      {/* Center stats */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-white/50 uppercase tracking-wider">
            Depth
          </span>
          <span className="text-sm font-mono text-cyan-300 tabular-nums">
            {depth.toFixed(2)} LY
          </span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-white/50 uppercase tracking-wider">
            Resonance
          </span>
          <span className="text-sm font-mono text-violet-300 tabular-nums">
            {resonance.toFixed(0)} Hz
          </span>
        </div>
      </div>

      {/* Audio visualizer */}
      <div className="flex items-center gap-2">
        <Waves className="w-4 h-4 text-fuchsia-400/70 hidden sm:block" />
        <canvas
          ref={canvasRef}
          className="w-24 h-8 sm:w-32 sm:h-10 rounded-lg"
          style={{
            background: "rgba(7, 3, 30, 0.6)",
            border: "1px solid rgba(168, 85, 247, 0.15)",
          }}
        />
      </div>
    </motion.div>
  );
}
