import React, { useEffect, useRef, useState } from "react";
import { ColorSwatch, Group } from "@mantine/core";
import axios from "axios";
import { Button } from "@/components/ui/button";

const SWATCHES = ["#ffffff", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b"];

interface GeneratedResponse {
  expression: string;
  result: string;
  assign: boolean;
}

interface RenderedOutput {
  expression: string;
  result: string;
  x: number;
  y: number;
}

export default function HomeScreen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("#ffffff");

  const [dictOfVars, setDictOfVars] = useState<Record<string, any>>({});
  const [outputs, setOutputs] = useState<RenderedOutput[]>([]);

  const strokeBounds = useRef<{
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }>({
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
  });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = selectedColor;
  }, [selectedColor]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const resetStrokeBounds = () => {
    strokeBounds.current = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };
  };

  const updateStrokeBounds = (x: number, y: number) => {
    if (x < strokeBounds.current.minX) strokeBounds.current.minX = x;
    if (x > strokeBounds.current.maxX) strokeBounds.current.maxX = x;
    if (y < strokeBounds.current.minY) strokeBounds.current.minY = y;
    if (y > strokeBounds.current.maxY) strokeBounds.current.maxY = y;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x,y);
    setIsDrawing(true);

    updateStrokeBounds(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, e.clientY);y
    ctx.stroke();

    updateStrokeBounds(x, y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    setOutputs([]);
    setDictOfVars({});
    resetStrokeBounds();
  };

  const sendDataToBackend = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const base64ImageData = canvas.toDataURL("image/png");

    const targetX =
      strokeBounds.current.maxX !== -Infinity
        ? strokeBounds.current.maxX + 20
        : window.innerWidth / 2;
    const targetY =
      strokeBounds.current.minY !== -Infinity
        ? strokeBounds.current.minY
        : window.innerHeight / 2;

    try {
      const response = await axios.post("http://localhost:8900/calculate", {
        image: base64ImageData,
        dict_of_vars: dictOfVars,
      });

      if (response.data && response.data.status === "success") {
        const rawDataArray: GeneratedResponse[] = response.data.data;

        const newOutputs: RenderedOutput[] = [];
        const updatedVars = { ...dictOfVars };

        rawDataArray.forEach((item) => {
          if (item.assign) {
            updatedVars[item.expression] = item.result;
          }

          newOutputs.push({
            expression: item.expression,
            result: item.result,
            x: targetX,
            y: targetY,
          });
        });

        setDictOfVars(updatedVars);
        setOutputs((prev) => [...prev, ...newOutputs]);

        resetStrokeBounds();
      }
    } catch (error) {
      console.error("Failed to process image through AI layer", error);
    }
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Dynamic Absolute Math Canvas Overlay Elements */}
      {outputs.map((out, index) => (
        <div
          key={index}
          className="absolute z-20 pointer-events-auto bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-lg border border-zinc-700 text-white shadow-lg flex flex-col font-mono text-sm max-w-xs transition-all duration-300 animate-in fade-in zoom-in-95"
          style={{ left: `${out.x}px`, top: `${out.y}px` }}
        >
          <span className="text-zinc-400 text-xs select-none">
            Expr: {out.expression}
          </span>
          <span className="text-emerald-400 font-bold text-lg mt-0.5">
            = {out.result}
          </span>
        </div>
      ))}

      {/* Control Panel Panel */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-6 items-center bg-zinc-900 px-6 py-4 rounded-full border border-zinc-700 shadow-2xl">
        <Button variant="destructive" onClick={resetCanvas}>
          Reset
        </Button>

        <Group spacing="sm">
          {SWATCHES.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              onClick={() => setSelectedColor(color)}
              className="cursor-pointer hover:scale-110 transition-transform"
              style={{
                border: selectedColor === color ? "2px solid white" : "none",
              }}
            />
          ))}
        </Group>

        <Button
          className="bg-white text-black hover:bg-zinc-200"
          onClick={sendDataToBackend}
        >
          Calculate
        </Button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute top-0 left-0 w-full h-full block cursor-crosshair"
      />
    </div>
  );
}
