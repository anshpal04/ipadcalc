import React, { useEffect, useRef, useState, usestate } from "react";
import { colorsTuple, ColorSwatch, Group } from "@mantine/core";
import axios from "axios";
import { Button } from "@/components/ui/button"

// predifined array of hex colors
const SWATCHES = [
  "#ffffff", // White
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#f59e0b", // Yellow
]

export default function HomeScreen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = usestate("#ffffff");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3'
    ctx.strokeStyle = selectedColor;
  }, [selectedColor]); //this re-runs the effect everytime color is selected

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
    setIsDrawing(true);

  };

  const draw = (e: React..MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineTo(e.clientX, e.clientY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  };

  const sendDataToBackend = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // convert the canvas to image learn about base64 encoded image
    const base64ImageData = canvas.toDataURL("image/png");

    try {
      const response = await axios.post("https://localhost:8900/calculate", {
        image: base64ImageData,
        dict_of_vars: {},
      });
      console.log("AI Response:", response.data);

    } catch (error) {
      console.error("failed to process image", error);
    }

  };

  return (
    <div className="relaive w-full h-full bg-black overflow-hidden select-none">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-6 items-center bg-zinc-900 px-6 py-4 rounded-full border border-zinc-700 shadow-2xl">
        <Button variant="destructive" onClick={resetCanvas}>Reset</Button>
        <Group spacing="sm">
          {SWATCHES.map((color) => (
                      <ColorSwatch
                        key={color}
                        color={color}
                        onClick={() => setSelectedColor(color)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        style={{ border: selectedColor === color ? "2px solid white" : "none" }}
                      />
                    ))}
        </Group>
        <Button className="bg-white text-black hover:bg-zinc-200" onClick={sendDataToBackend}>
                  Calculate
                </Button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="absolute top-0 w-full h-full block bg-black"
      />
    </div>
  )
}
