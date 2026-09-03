import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRandomLore, type LoreEntry } from "./lore";

interface Props {
  triggerKey: number;
}

export default function LoreTooltip({ triggerKey }: Props) {
  const [lore, setLore] = useState<LoreEntry | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (triggerKey > 0) {
      setLore(getRandomLore());
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [triggerKey]);

  return (
    <AnimatePresence mode="wait">
      {visible && lore && (
        <motion.div
          key={triggerKey}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-20 right-4 sm:right-6 z-30 max-w-xs pointer-events-none"
        >
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(7, 3, 30, 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(168, 85, 247, 0.25)",
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "#06b6d4", boxShadow: "0 0 8px #06b6d4" }}
              />
              <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/80">
                Cosmic Lore
              </span>
            </div>
            <h3 className="text-sm font-bold text-violet-200 mb-1">
              {lore.title}
            </h3>
            <p className="text-xs text-white/60 leading-relaxed">{lore.body}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
