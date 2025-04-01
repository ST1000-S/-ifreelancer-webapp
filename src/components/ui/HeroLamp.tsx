import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type HeroLampProps = {
  children: React.ReactNode;
  className?: string;
};

export function HeroLamp({ children, className }: HeroLampProps) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Lamp gradient background */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          initial={{ opacity: 0.4, width: "15rem" }}
          animate={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            top: "-10rem",
            aspectRatio: "1/1",
            background:
              "conic-gradient(from 230.29deg at 51.63% 52.16%, #0047b2 0deg, #007bff 67.5deg, #6366f1 198.75deg, #a855f7 251.25deg, #7149C6 301.88deg, #0047b2 360deg)",
            borderRadius: "50%",
            filter: "blur(130px)",
          }}
        />
      </div>

      {/* Main spotlight effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeIn" }}
        className="absolute inset-0 z-10"
      >
        <div
          style={{
            position: "absolute",
            inset: "0px",
            background:
              "radial-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%)",
            transform: "translateZ(0px)",
          }}
        />
      </motion.div>

      {/* Pulse effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <div className="h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
      </motion.div>

      {/* Moving gradient overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 0.8, ease: "easeIn" }}
        className="absolute inset-0 z-10 bg-gradient-to-b from-primary/20 via-transparent to-primary/5"
      />

      {/* Content layer */}
      <div className="relative z-30">{children}</div>
    </div>
  );
}

export function HeroContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center"
    >
      {children}
    </motion.div>
  );
}
