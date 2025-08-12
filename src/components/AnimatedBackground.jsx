import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();

  const waveProps = prefersReducedMotion ? {} : {
    animate: { y: [0, 20, 0] },
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
  };

  const leafProps = prefersReducedMotion ? {} : {
    animate: { y: [0, -15, 0], rotate: [0, 5, -5, 0] },
    transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <motion.svg
        width="120%"
        height="40%"
        viewBox="0 0 800 200"
        style={{ position: "absolute", bottom: 0, left: 0 }}
        {...waveProps}
      >
        <path
          d="M0 100 Q 100 150 200 100 T 400 100 T 600 100 T 800 100 V200 H0 Z"
          fill="#CDEFFF"
        />
      </motion.svg>

      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ position: "absolute", top: 40, right: 40 }}
        {...leafProps}
      >
        <path
          d="M100 0 C120 40 140 80 100 200 C60 80 80 40 100 0 Z"
          fill="#A4EFC7"
        />
      </motion.svg>
    </div>
  );
}

