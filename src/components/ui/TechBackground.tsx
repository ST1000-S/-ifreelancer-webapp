import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "./glowing-effect";

type TechBackgroundProps = {
  children: React.ReactNode;
  className?: string;
};

export function TechBackground({ children, className }: TechBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800",
        className
      )}
    >
      {/* Circuit pattern background */}
      <div className="absolute inset-0 bg-[url('/images/circuit-pattern.svg')] bg-repeat opacity-5"></div>

      {/* Animated tech circles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{
              opacity: 0.5,
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: Math.random() * 0.5 + 0.5,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <div className={`w-64 h-64 rounded-full bg-primary/5 blur-2xl`} />
          </motion.div>
        ))}
      </div>

      {/* Glowing boxes in the background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${15 + i * 30}%`,
              top: `${20 + i * 20}%`,
              transform: `rotate(${i * 15}deg)`,
            }}
          >
            <div className="relative w-48 h-48 border border-primary/20 rounded-lg">
              <GlowingEffect
                blur={5}
                spread={20}
                glow={true}
                disabled={false}
                proximity={80}
                inactiveZone={0.2}
                movementDuration={1.5}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Grid lines */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-cover opacity-10"></div>

      {/* Main content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
