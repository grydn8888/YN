import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DecisionAnswer } from '../types';
import { sound } from '../utils/sound';

interface PulsingOrbProps {
  isPulsing: boolean;
  oracleAnswer: DecisionAnswer | null;
  showAnswer: boolean;
  onRevealComplete?: () => void;
  onClick?: () => void;
  isPrompting?: boolean;
}

// Convert polar coordinates to Cartesian (cx, cy = 150)
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

export const PulsingOrb: React.FC<PulsingOrbProps> = ({
  isPulsing,
  oracleAnswer,
  showAnswer,
  onRevealComplete,
  onClick,
  isPrompting,
}) => {
  const [pulseCount, setPulseCount] = useState(0);

  // Sound pulse effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPulsing) {
      setPulseCount(0);
      interval = setInterval(() => {
        setPulseCount((prev) => prev + 1);
        sound.playPulse(150 + (pulseCount % 3) * 40);
      }, 380);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPulsing, pulseCount]);

  // Reveal audio
  useEffect(() => {
    if (showAnswer && oracleAnswer) {
      sound.playReveal(oracleAnswer === 'YES');
      const timer = setTimeout(() => {
        if (onRevealComplete) onRevealComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [showAnswer, oracleAnswer, onRevealComplete]);

  // Generate 24 Outer Sunburst Facets
  const outerSunburstFacets = useMemo(() => {
    const facets = [];
    const count = 24;
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const angle = i * step;
      const tip = polarToCartesian(150, 150, 146, angle);
      const leftBase = polarToCartesian(150, 150, 134, angle - step / 2);
      const rightBase = polarToCartesian(150, 150, 134, angle + step / 2);
      const innerCrease = polarToCartesian(150, 150, 132, angle);

      facets.push(
        <g key={`sunburst-${i}`}>
          {/* Left half facet */}
          <polygon
            points={`${tip.x},${tip.y} ${leftBase.x},${leftBase.y} ${innerCrease.x},${innerCrease.y}`}
            fill={i % 2 === 0 ? '#000000' : '#ffffff'}
            stroke="#000000"
            strokeWidth="0.8"
          />
          {/* Right half facet */}
          <polygon
            points={`${tip.x},${tip.y} ${rightBase.x},${rightBase.y} ${innerCrease.x},${innerCrease.y}`}
            fill={i % 2 === 0 ? '#ffffff' : '#000000'}
            stroke="#000000"
            strokeWidth="0.8"
          />
        </g>
      );
    }
    return facets;
  }, []);

  // Generate 16 Chiseled Diamond Facets
  const facetedDiamondRing = useMemo(() => {
    const diamonds = [];
    const count = 16;
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const angle = i * step;
      const outerTip = polarToCartesian(150, 150, 132, angle);
      const innerTip = polarToCartesian(150, 150, 120, angle);
      const leftWing = polarToCartesian(150, 150, 126, angle - step / 2);
      const rightWing = polarToCartesian(150, 150, 126, angle + step / 2);

      diamonds.push(
        <g key={`diamond-${i}`}>
          <polygon
            points={`${outerTip.x},${outerTip.y} ${leftWing.x},${leftWing.y} ${innerTip.x},${innerTip.y}`}
            fill={i % 2 === 0 ? '#000000' : '#ffffff'}
            stroke="#000000"
            strokeWidth="0.9"
          />
          <polygon
            points={`${outerTip.x},${outerTip.y} ${rightWing.x},${rightWing.y} ${innerTip.x},${innerTip.y}`}
            fill={i % 2 === 0 ? '#ffffff' : '#000000'}
            stroke="#000000"
            strokeWidth="0.9"
          />
        </g>
      );
    }
    return diamonds;
  }, []);

  // Generate 8 Stylized Multi-Faced Oracle Entities around the wheel
  const oracleFaces = useMemo(() => {
    const faces = [];
    for (let i = 0; i < 8; i++) {
      const angle = i * 45;
      faces.push(
        <g
          key={`oracle-face-${i}`}
          transform={`rotate(${angle} 150 150)`}
          className="transition-opacity duration-300"
        >
          {/* Crown Spire / Crest */}
          <polygon
            points="150,29 142,42 150,38 158,42"
            fill={i % 2 === 0 ? '#000000' : '#ffffff'}
            stroke="#000000"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <polygon
            points="150,29 135,37 142,42"
            fill="#000000"
            stroke="#000000"
            strokeWidth="0.8"
          />
          <polygon
            points="150,29 165,37 158,42"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="0.8"
          />

          {/* Brow Shield */}
          <path
            d="M 134,45 L 150,41 L 166,45 L 150,48 Z"
            fill="#000000"
            stroke="#000000"
            strokeWidth="0.8"
          />

          {/* Third Eye Bindu Facet */}
          <polygon
            points="150,42 146,46 150,50 154,46"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="1"
          />

          {/* Left Eye & Cheek Facets (All-Seeing Oracle) */}
          <polygon
            points="138,51 144,50 142,55 136,54"
            fill="#000000"
          />
          <polygon
            points="135,55 143,55 141,64 133,60"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="1"
          />
          <line x1="133" y1="60" x2="141" y2="64" stroke="#000000" strokeWidth="1" />

          {/* Right Eye & Cheek Facets */}
          <polygon
            points="162,51 156,50 158,55 164,54"
            fill="#000000"
          />
          <polygon
            points="165,55 157,55 159,64 167,60"
            fill="#000000"
            stroke="#000000"
            strokeWidth="1"
          />

          {/* Nose Ridge / Chiseled Face Spine */}
          <polygon
            points="150,48 147,61 150,64 153,61"
            fill={i % 2 === 0 ? '#ffffff' : '#000000'}
            stroke="#000000"
            strokeWidth="1"
          />

          {/* Chin / Sacred Jawline Facets */}
          <polygon
            points="141,64 150,65 150,74 144,71"
            fill="#000000"
            stroke="#000000"
            strokeWidth="0.8"
          />
          <polygon
            points="159,64 150,65 150,74 156,71"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="0.8"
          />

          {/* Lower Collar Radiation Points */}
          <polygon
            points="144,71 150,74 150,81 146,78"
            fill={i % 2 === 0 ? '#ffffff' : '#000000'}
            stroke="#000000"
            strokeWidth="0.8"
          />
          <polygon
            points="156,71 150,74 150,81 154,78"
            fill={i % 2 === 0 ? '#000000' : '#ffffff'}
            stroke="#000000"
            strokeWidth="0.8"
          />
        </g>
      );
    }
    return faces;
  }, []);

  // Generate 8 Inner Sacred Octagram Star Facets
  const innerStarFacets = useMemo(() => {
    const petals = [];
    const count = 8;
    const step = 360 / count;
    for (let i = 0; i < count; i++) {
      const angle = i * step + step / 2;
      const tip = polarToCartesian(150, 150, 77, angle);
      const innerLeft = polarToCartesian(150, 150, 52, angle - step / 2);
      const innerRight = polarToCartesian(150, 150, 52, angle + step / 2);
      const mid = polarToCartesian(150, 150, 50, angle);

      petals.push(
        <g key={`star-petal-${i}`}>
          <polygon
            points={`${tip.x},${tip.y} ${innerLeft.x},${innerLeft.y} ${mid.x},${mid.y}`}
            fill={i % 2 === 0 ? '#000000' : '#ffffff'}
            stroke="#000000"
            strokeWidth="1"
          />
          <polygon
            points={`${tip.x},${tip.y} ${innerRight.x},${innerRight.y} ${mid.x},${mid.y}`}
            fill={i % 2 === 0 ? '#ffffff' : '#000000'}
            stroke="#000000"
            strokeWidth="1"
          />
        </g>
      );
    }
    return petals;
  }, []);

  return (
    <div
      id="oracle-decision-graphic-container"
      onClick={onClick}
      className="relative w-72 h-72 xs:w-80 xs:h-80 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] lg:w-[480px] lg:h-[480px] max-w-[92vw] aspect-square mx-auto flex items-center justify-center select-none shrink-0 cursor-pointer group"
    >
      {/* Dynamic Multi-Faced Mandala SVG Stage */}
      <svg
        viewBox="0 0 300 300"
        className="w-full h-full overflow-visible drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
      >
        <defs>
          {/* Subtle Radial Gradient for Mandala Atmosphere */}
          <radialGradient id="mandala-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.06" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Mandala Background Halo */}
        <circle cx="150" cy="150" r="148" fill="url(#mandala-glow)" />

        {/* LAYER 1: Outer Sunburst Teeth Ring (Rotates Clockwise) */}
        <motion.g
          style={{ transformOrigin: '150px 150px' }}
          animate={{
            rotate: 360,
            scale: isPulsing ? [1, 1.04, 0.98, 1.03, 1] : [1, 1.015, 1],
          }}
          transition={{
            rotate: {
              repeat: Infinity,
              duration: isPulsing ? 8 : 45,
              ease: 'linear',
            },
            scale: {
              repeat: Infinity,
              duration: isPulsing ? 0.75 : 4,
              ease: 'easeInOut',
            },
          }}
        >
          {/* Perimeter Framing Rings */}
          <circle
            cx="150"
            cy="150"
            r="147"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
          <circle
            cx="150"
            cy="150"
            r="134"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          {outerSunburstFacets}
        </motion.g>

        {/* LAYER 2: Chiseled Diamond Facets Ring (Rotates Counter-Clockwise) */}
        <motion.g
          style={{ transformOrigin: '150px 150px' }}
          animate={{
            rotate: -360,
          }}
          transition={{
            repeat: Infinity,
            duration: isPulsing ? 10 : 35,
            ease: 'linear',
          }}
        >
          <circle
            cx="150"
            cy="150"
            r="121"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
          />
          {facetedDiamondRing}
        </motion.g>

        {/* LAYER 3: The 8-Faced Oracle Ring (Rotates Clockwise with Rhythmic Pulse) */}
        <motion.g
          style={{ transformOrigin: '150px 150px' }}
          animate={{
            rotate: 360,
            scale: isPulsing ? [0.96, 1.05, 0.96] : [1, 1.02, 1],
          }}
          transition={{
            rotate: {
              repeat: Infinity,
              duration: isPulsing ? 6 : 28,
              ease: 'linear',
            },
            scale: {
              repeat: Infinity,
              duration: isPulsing ? 0.65 : 3.5,
              ease: 'easeInOut',
            },
          }}
        >
          {/* Orbital Guidelines */}
          <circle
            cx="150"
            cy="150"
            r="119"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
          />
          <circle
            cx="150"
            cy="150"
            r="78"
            fill="none"
            stroke="#000000"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />
          {oracleFaces}
        </motion.g>

        {/* LAYER 4: Inner Sacred Octagram Star (Rotates Counter-Clockwise) */}
        <motion.g
          style={{ transformOrigin: '150px 150px' }}
          animate={{
            rotate: -360,
            scale: isPulsing ? [1, 1.06, 0.97, 1] : 1,
          }}
          transition={{
            rotate: {
              repeat: Infinity,
              duration: isPulsing ? 4.5 : 20,
              ease: 'linear',
            },
            scale: {
              repeat: Infinity,
              duration: 0.75,
              ease: 'easeInOut',
            },
          }}
        >
          {innerStarFacets}
        </motion.g>

        {/* Pulsing Acoustic & Vision Waves Emitter (When Consulting Oracle) */}
        {isPulsing && (
          <>
            <motion.circle
              cx="150"
              cy="150"
              fill="none"
              stroke="#000000"
              strokeWidth="2"
              initial={{ r: 48, opacity: 0.9 }}
              animate={{ r: 142, opacity: 0 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.circle
              cx="150"
              cy="150"
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              initial={{ r: 48, opacity: 0.8 }}
              animate={{ r: 110, opacity: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.4,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.circle
              cx="150"
              cy="150"
              fill="none"
              stroke="#000000"
              strokeWidth="1"
              initial={{ r: 48, opacity: 1 }}
              animate={{ r: 85, opacity: 0 }}
              transition={{
                duration: 1.2,
                delay: 0.7,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </>
        )}

        {/* LAYER 5: Central Decision Medallion Frame */}
        {/* Outer Medallion Border */}
        <circle
          cx="150"
          cy="150"
          r="48"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="3.5"
        />
        {/* Inner Reticle Accent */}
        <circle
          cx="150"
          cy="150"
          r="43"
          fill="none"
          stroke="#000000"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
      </svg>

      {/* Center Decision Medallion (Interactive DOM Content inside the Mandala Hub) */}
      <motion.div
        id="central-oracle-orb"
        className={`absolute z-10 w-28 h-28 xs:w-32 xs:h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center border-[4px] sm:border-[6px] border-black transition-colors duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.25)] ${
          showAnswer
            ? oracleAnswer === 'YES'
              ? 'bg-black text-white'
              : 'bg-white text-black'
            : isPulsing
            ? 'bg-black text-white'
            : 'bg-white text-black'
        }`}
        animate={
          isPulsing
            ? {
                scale: [0.93, 1.07, 0.93],
              }
            : isPrompting
            ? {
                scale: [1, 1.06, 1],
                borderColor: ['#000000', '#666666', '#000000'],
              }
            : { scale: 1 }
        }
        transition={{
          duration: isPulsing ? 0.75 : isPrompting ? 0.8 : 0.3,
          repeat: isPulsing || isPrompting ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <AnimatePresence mode="wait">
          {/* State 1: Idle Oracle */}
          {!isPulsing && !showAnswer && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center px-2 flex flex-col items-center justify-center"
            >
              {/* Mini Sacred Diamond Glyph */}
              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-black rotate-45 mb-1.5 sm:mb-2" />
              <span className="block text-base sm:text-2xl md:text-3xl font-black tracking-widest uppercase font-mono leading-none">
                ORACLE
              </span>
              <span className="block text-[9px] sm:text-xs md:text-sm font-mono tracking-[0.25em] text-neutral-500 uppercase mt-1">
                READY
              </span>
            </motion.div>
          )}

          {/* State 2: Consulting / Pulsing */}
          {isPulsing && (
            <motion.div
              key="pulsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center px-2 flex flex-col items-center justify-center"
            >
              <span className="block text-sm sm:text-xl md:text-2xl font-black tracking-wider uppercase font-mono animate-pulse">
                SEEKING
              </span>
              <div className="flex justify-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}

          {/* State 3: Final Answer Revealed */}
          {showAnswer && oracleAnswer && (
            <motion.div
              key="answer"
              initial={{ opacity: 0, scale: 0.35, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.35 }}
              transition={{ type: 'spring', stiffness: 380, damping: 20 }}
              className="text-center"
            >
              <span
                id="oracle-revealed-answer-text"
                className={`block text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter font-mono ${
                  oracleAnswer === 'YES' ? 'text-white' : 'text-black'
                }`}
              >
                {oracleAnswer}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
