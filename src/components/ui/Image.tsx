import { useState, useEffect } from "react";
import NextImage from "next/image";
import { cn } from "@/lib/utils";

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export function Image({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  objectFit = "cover",
}: ImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blurDataURL, setBlurDataURL] = useState<string>();

  useEffect(() => {
    // Generate blur placeholder
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 40;
      canvas.height = 40;
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(0, 0, 40, 40);
      setBlurDataURL(canvas.toDataURL());
    }
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        loading && "animate-pulse bg-gray-200",
        className
      )}
      style={{ width, height }}
    >
      {!error ? (
        <NextImage
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "duration-700 ease-in-out",
            loading
              ? "scale-110 blur-2xl grayscale"
              : "scale-100 blur-0 grayscale-0"
          )}
          style={{
            objectFit,
            width: "100%",
            height: "100%",
          }}
          quality={quality}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL}
          onLoadingComplete={() => setLoading(false)}
          onError={() => setError(true)}
        />
      ) : (
        <div
          className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800"
          style={{ width, height }}
        >
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Error loading image
          </span>
        </div>
      )}
    </div>
  );
}
