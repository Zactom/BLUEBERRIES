import { motion } from "framer-motion";
import { Gauge, Layers, Rocket, Zap } from "lucide-react";

export type LayerId = "surface" | "cellular" | "singularity";

interface Props {
  distortion: number;
  setDistortion: (v: number) => void;
  warp: boolean;
  setWarp: (v: boolean) => void;
  onLayerJump: (layer: LayerId) => void;
  activeLayer: LayerId;
}

export default function ControlDock({
  distortion,
  setDistortion,
  warp,
  setWarp,
  onLayerJump,
  activeLayer,
}: Props) {
  const layers: { id: LayerId; label: string }[] = [
    { id: "surface", label: "Surface" },
    { id: "cellular", label: "Cellular" },
    { id: "singularity", label: "Singularity" },
  ];

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl"
    >
      <div
        className="rounded-2xl px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        style={{
          background: "rgba(7, 3, 30, 0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(168, 85, 247, 0.2)",
          boxShadow:
            "0 0 40px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Distortion slider */}
        <div className="flex items-center gap-3 flex-1 w-full">
          <Gauge className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-white/50">
                Morph Distortion
              </span>
              <span className="text-[10px] font-mono text-cyan-300 tabular-nums">
                {distortion.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.01}
              value={distortion}
              onChange={(e) => setDistortion(parseFloat(e.target.value))}
              className="w-full multiverse-slider"
            />
          </div>
        </div>

        {/* Warp toggle */}
        <button
          onClick={() => setWarp(!warp)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 shrink-0"
          style={{
            background: warp
              ? "rgba(168, 85, 247, 0.25)"
              : "rgba(255,255,255,0.05)",
            border: `1px solid ${warp ? "rgba(168, 85, 247, 0.5)" : "rgba(255,255,255,0.1)"}`,
            boxShadow: warp ? "0 0 20px rgba(168, 85, 247, 0.4)" : "none",
          }}
        >
          <Zap
            className={`w-4 h-4 transition-colors ${warp ? "text-violet-300" : "text-white/40"}`}
            style={warp ? { filter: "drop-shadow(0 0 4px rgba(168,85,247,0.8))" } : {}}
          />
          <span
            className={`text-xs uppercase tracking-wider transition-colors ${warp ? "text-violet-200" : "text-white/40"}`}
          >
            Warp
          </span>
          <Rocket
            className={`w-3.5 h-3.5 transition-all ${warp ? "text-fuchsia-300 translate-x-0.5" : "text-white/20"}`}
          />
        </button>

        {/* Layer jumps */}
        <div className="flex items-center gap-1 shrink-0">
          <Layers className="w-4 h-4 text-fuchsia-400/60 mr-1" />
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerJump(layer.id)}
              className="px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all duration-300 relative overflow-hidden"
              style={{
                background:
                  activeLayer === layer.id
                    ? "rgba(217, 70, 239, 0.2)"
                    : "rgba(255,255,255,0.03)",
                border: `1px solid ${activeLayer === layer.id ? "rgba(217, 70, 239, 0.4)" : "rgba(255,255,255,0.08)"}`,
                color:
                  activeLayer === layer.id ? "#f0abfc" : "rgba(255,255,255,0.4)",
              }}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
