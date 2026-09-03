import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, Info } from "lucide-react";
import MultiverseCanvas from "./multiverse/MultiverseCanvas";
import HudBar from "./multiverse/HudBar";
import ControlDock, { type LayerId } from "./multiverse/ControlDock";
import GlowingCursor from "./multiverse/GlowingCursor";
import LoreTooltip from "./multiverse/LoreTooltip";
import type { MultiverseRenderer } from "./multiverse/MultiverseRenderer";
import type { Stage } from "./multiverse/MultiverseRenderer";

const stageNames = ["The Quantum Berry", "Anthocyanin Deep Zoom", "Jam Singularity"];
const stageDescriptions = [
  "A sentient cosmic blueberry pulses at the heart of the multiverse. Drag to rotate. Dive in when you're ready.",
  "Falling through the skin into an infinite recursive tunnel of molecular lattices and bio-luminescent tendrils.",
  "A churning, viscous ocean of hyper-saturated indigo matter. All timelines dissolve into quantum preserve.",
];

const layerToStage: Record<LayerId, Stage> = {
  surface: 0,
  cellular: 1,
  singularity: 2,
};

const stageToLayer: Record<number, LayerId> = {
  0: "surface",
  1: "cellular",
  2: "singularity",
};

export default function App() {
  const [distortion, setDistortion] = useState(0.5);
  const [warp, setWarp] = useState(true);
  const [stage, setStage] = useState<Stage>(0);
  const [depth, setDepth] = useState(0);
  const [diveTrigger, setDiveTrigger] = useState(0);
  const [loreTrigger, setLoreTrigger] = useState(0);
  const [showLore, setShowLore] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerId>("surface");
  const rendererRef = useRef<MultiverseRenderer | null>(null);

  const handleReady = useCallback((r: MultiverseRenderer) => {
    rendererRef.current = r;
  }, []);

  const handleDepthChange = useCallback((d: number) => {
    setDepth(d);
  }, []);

  const handleDiveIn = useCallback(() => {
    setDiveTrigger((n) => n + 1);
    setTimeout(() => {
      setStage(1);
      setActiveLayer("cellular");
    }, 700);
  }, []);

  const handleLayerJump = useCallback(
    (layer: LayerId) => {
      const newStage = layerToStage[layer];
      setStage(newStage);
      setActiveLayer(layer);
    },
    []
  );

  const handleLore = useCallback(() => {
    setShowLore(true);
    setLoreTrigger((n) => n + 1);
    setTimeout(() => setShowLore(false), 6000);
  }, []);

  // Auto-advance stages based on scroll
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (stage === 0 && e.deltaY > 30) {
        // Scroll down from hero triggers dive
      }
    };
    window.addEventListener("wheel", onWheel);
    return () => window.removeEventListener("wheel", onWheel);
  }, [stage]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030014] cursor-none">
      {/* 3D Canvas */}
      <MultiverseCanvas
        distortion={distortion}
        warp={warp ? 2 : 1}
        stage={stage}
        diveTrigger={diveTrigger}
        onDepthChange={handleDepthChange}
        onReady={handleReady}
      />

      {/* Custom cursor */}
      <GlowingCursor />

      {/* HUD top bar */}
      <HudBar depth={depth} resonance={432} />

      {/* Lore tooltip */}
      {showLore && <LoreTooltip triggerKey={loreTrigger} />}

      {/* Lore button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        onClick={handleLore}
        data-interactive
        className="fixed top-20 left-4 sm:left-6 z-40 flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300"
        style={{
          background: "rgba(7, 3, 30, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(6, 182, 212, 0.2)",
        }}
      >
        <Info className="w-4 h-4 text-cyan-400" />
        <span className="text-[10px] uppercase tracking-wider text-white/60">
          Lore
        </span>
      </motion.button>

      {/* Hero overlay text — Stage 0 */}
      <AnimatePresence mode="wait">
        {stage === 0 && (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-center pointer-events-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <span className="text-xs uppercase tracking-[0.4em] text-cyan-400/70">
                  Welcome to
                </span>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h1
                className="text-5xl sm:text-7xl md:text-8xl font-bold text-center mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #a855f7 50%, #d946ef 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 30px rgba(168, 85, 247, 0.3))",
                }}
              >
                BLUEBERRY
              </h1>
              <h2
                className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-6 tracking-[0.15em]"
                style={{
                  background:
                    "linear-gradient(135deg, #d946ef 0%, #a855f7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                MULTIVERSE
              </h2>
              <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto mb-8 leading-relaxed px-4">
                {stageDescriptions[0]}
              </p>

              {/* Dive In button */}
              <motion.button
                onClick={handleDiveIn}
                data-interactive
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 rounded-full overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  boxShadow: "0 0 40px rgba(168, 85, 247, 0.2)",
                }}
              >
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(6, 182, 212, 0.3))",
                  }}
                />
                <span className="relative flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-white">
                  Dive In
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage 1 & 2 overlay — stage name + description */}
      <AnimatePresence mode="wait">
        {stage > 0 && (
          <motion.div
            key={`stage-${stage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="fixed left-4 sm:left-6 top-1/2 -translate-y-1/2 z-10 max-w-xs pointer-events-none"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-1 h-8 rounded-full"
                style={{
                  background: "linear-gradient(180deg, #06b6d4, #a855f7)",
                  boxShadow: "0 0 12px rgba(168, 85, 247, 0.5)",
                }}
              />
              <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/60">
                Stage {stage + 1}
              </span>
            </div>
            <h2
              className="text-xl sm:text-2xl font-bold mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #06b6d4, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {stageNames[stage]}
            </h2>
            <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
              {stageDescriptions[stage]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll hint for stage transitions */}
      <AnimatePresence>
        {stage > 0 && stage < 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none"
          >
            <span className="text-[10px] uppercase tracking-wider text-white/30">
              Use Layer Jumps below
            </span>
            <ChevronDown className="w-4 h-4 text-white/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom dock */}
      <ControlDock
        distortion={distortion}
        setDistortion={setDistortion}
        warp={warp}
        setWarp={setWarp}
        onLayerJump={handleLayerJump}
        activeLayer={activeLayer}
      />

      {/* Edge glow frame */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          boxShadow:
            "inset 0 0 120px rgba(168, 85, 247, 0.08), inset 0 0 60px rgba(6, 182, 212, 0.05)",
        }}
      />
    </div>
  );
}
