import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion();

  const waveProps = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 20, 0] },
        transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
      };

  const wavePropsSecondary = prefersReducedMotion
    ? {}
    : {
        animate: { y: [0, 15, 0] },
        transition: {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        },
      };

  const leafProps = prefersReducedMotion
    ? {}
    : {
        animate: { x: [0, 15, 0], rotate: [0, 360] },
        transition: {
          x: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 30, repeat: Infinity, ease: "linear" },
        },
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
      >
        <defs>
          <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cdefff" />
            <stop offset="100%" stopColor="#00a9a5" />
          </linearGradient>
        </defs>
        <motion.path
          d="M0 100 Q 100 150 200 100 T 400 100 T 600 100 T 800 100 V200 H0 Z"
          fill="url(#waveGradient)"
          {...waveProps}
        />
        <motion.path
          d="M0 120 Q 150 170 300 120 T 600 120 T 800 120 V200 H0 Z"
          fill="url(#waveGradient)"
          opacity="0.5"
          {...wavePropsSecondary}
        />
      </motion.svg>

      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        style={{ position: "absolute", top: 40, right: 40 }}
        {...leafProps}
      >
        <defs>
          <linearGradient id="leafGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a4efc7" />
            <stop offset="100%" stopColor="#63c19e" />
          </linearGradient>
        </defs>
        <path
          d="M100 10 C140 40 160 100 100 190 C40 100 60 40 100 10 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M100 40 C110 80 110 120 100 160"
          stroke="#63c19e"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M100 80 C120 90 140 110 150 130"
          stroke="#63c19e"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M100 80 C80 90 60 110 50 130"
          stroke="#63c19e"
          strokeWidth="1.5"
          fill="none"
        />
      </motion.svg>
    </div>
  );
}

