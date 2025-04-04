import React, { useEffect, useRef } from "react";

interface MatrixRainProps {
  fontSize?: number;
  color?: string;
  characters?: string;
  fadeOpacity?: number;
  speed?: number;
  density?: number;
}

const MatrixRain: React.FC<MatrixRainProps> = ({
  fontSize = 14,
  color = "#0ea5e9",
  characters = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
  fadeOpacity = 0.05,
  speed = 1,
  density = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const chars = characters.split("");
    const drops: number[] = [];
    const columnCount = Math.floor((canvas.width / fontSize) * density);

    // Add more starting drops for a fuller effect
    for (let i = 0; i < columnCount; i++) {
      drops[i] =
        ((Math.random() * canvas.height) / fontSize) * 2 -
        canvas.height / fontSize;
    }

    const draw = () => {
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      // Add slight transparency for depth
      ctx.globalAlpha = 0.85;

      for (let i = 0; i < drops.length; i++) {
        // Vary the opacity of characters to create depth
        const opacity = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = color
          .replace(")", `, ${opacity})`)
          .replace("rgb", "rgba");

        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * (fontSize / density);
        ctx.fillText(char, x, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += speed;
      }

      // Reset opacity
      ctx.globalAlpha = 1.0;
    };

    const interval = setInterval(draw, 33 / speed);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [fontSize, color, characters, fadeOpacity, speed, density]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
};

export default MatrixRain;
