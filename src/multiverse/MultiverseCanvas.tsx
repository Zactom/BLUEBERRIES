import { useEffect, useRef } from "react";
import { MultiverseRenderer, type Stage } from "./MultiverseRenderer";

interface Props {
  distortion: number;
  warp: number;
  stage: Stage;
  diveTrigger: number;
  onDepthChange: (depth: number) => void;
  onReady: (renderer: MultiverseRenderer) => void;
}

export default function MultiverseCanvas({
  distortion,
  warp,
  stage,
  diveTrigger,
  onDepthChange,
  onReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MultiverseRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const r = new MultiverseRenderer(canvasRef.current);
    r.onDepthChange = onDepthChange;
    r.start();
    rendererRef.current = r;
    onReady(r);

    return () => {
      r.dispose();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rendererRef.current?.setDistortion(distortion);
  }, [distortion]);

  useEffect(() => {
    rendererRef.current?.setWarp(warp);
  }, [warp]);

  useEffect(() => {
    rendererRef.current?.setStage(stage);
  }, [stage]);

  useEffect(() => {
    if (diveTrigger > 0) {
      rendererRef.current?.diveIn();
    }
  }, [diveTrigger]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ touchAction: "none" }}
    />
  );
}
