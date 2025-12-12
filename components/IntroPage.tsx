import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroPageProps {
  onStart: () => void;
}

const PRESET_COLORS = [
  { hex: '#FFD700', name: 'Spectra Yellow' },
  { hex: '#FF6B6B', name: 'Living Coral' },
  { hex: '#4ECDC4', name: 'Light Turquoise' },
  { hex: '#45B7D1', name: 'Sky Blue' },
  { hex: '#96CEB4', name: 'Green Lily' },
  { hex: '#FFEEAD', name: 'Double Cream' },
  { hex: '#D4A5A5', name: 'Dusty Cedar' },
  { hex: '#9B59B6', name: 'Radiant Orchid' },
  { hex: '#3498DB', name: 'Blueberry' },
  { hex: '#E67E22', name: 'Autumn Maple' },
  { hex: '#2ECC71', name: 'Greenery' },
  { hex: '#F1C40F', name: 'Mimosa' },
  { hex: '#E74C3C', name: 'Tangerine Tango' },
  { hex: '#1ABC9C', name: 'Arcadia' },
  { hex: '#95A5A6', name: 'Ultimate Gray' },
  { hex: '#FF9F43', name: 'Marigold' },
  { hex: '#5F27CD', name: 'Ultra Violet' },
  { hex: '#FF9FF3', name: 'Pink Lavender' }
];

export const IntroPage: React.FC<IntroPageProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<{id: string, x: number, y: number, rot: number, color: typeof PRESET_COLORS[0]}[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const newCards: {id: string, x: number, y: number, rot: number, color: typeof PRESET_COLORS[0]}[] = [];
    const cardW = 160; // w-40
    const cardH = 96;  // h-24
    const maxOverlap = 0.3; // 30% max overlap
    
    // Shuffle colors
    const shuffledColors = [...PRESET_COLORS].sort(() => Math.random() - 0.5);

    shuffledColors.forEach((color, index) => {
      let bestX = Math.random() * (window.innerWidth - cardW);
      let bestY = Math.random() * (window.innerHeight - cardH);
      let valid = false;

      // Try 50 times to find a position with minimal overlap
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * (window.innerWidth - cardW);
        const y = Math.random() * (window.innerHeight - cardH);
        
        // Check overlap against existing cards
        let collision = false;
        for (const p of newCards) {
          const xOverlap = Math.max(0, Math.min(x + cardW, p.x + cardW) - Math.max(x, p.x));
          const yOverlap = Math.max(0, Math.min(y + cardH, p.y + cardH) - Math.max(y, p.y));
          const overlapArea = xOverlap * yOverlap;
          const cardArea = cardW * cardH;

          if (overlapArea > (cardArea * maxOverlap)) {
            collision = true;
            break;
          }
        }

        if (!collision) {
          bestX = x;
          bestY = y;
          valid = true;
          break;
        }
      }

      // If we couldn't find a perfect spot, we use the last random generated one (or initial),
      // effectively allowing some overlap rather than crashing or skipping.
      
      newCards.push({
        id: `card-${index}`,
        x: bestX,
        y: bestY,
        rot: Math.random() * 360,
        color
      });
    });

    setCards(newCards);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-[#FDFDFD] overflow-hidden flex flex-col items-center justify-center" ref={containerRef}>

      {/* Background Scattered Cards */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <AnimatePresence>
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              className="absolute w-40 h-24 bg-white shadow-lg flex flex-col"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: card.x,
                y: card.y,
                rotate: card.rot
              }}
              transition={{ duration: 0.5, delay: i * 0.02 }}
            >
              <div 
                className="flex-1 w-full" 
                style={{ backgroundColor: card.color.hex }}
              />
              <div className="h-6 w-full bg-white flex items-center justify-between px-2 text-[10px] font-mono text-gray-500">
                <span className="font-bold truncate max-w-[85px]">{card.color.name}</span>
                <span>{card.color.hex}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Foreground Content */}
      <div className="z-10 flex flex-col items-start max-w-4xl w-full px-8 pointer-events-none">
        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-black leading-[0.85] mix-blend-multiply">
          2025<br/>
          Colors
        </h1>
        <div className="h-8"></div>
      </div>

      <div className="z-20 absolute bottom-12 md:bottom-20 pointer-events-auto">
        <button 
          onClick={onStart}
          className="bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform shadow-xl active:scale-95"
        >
          나만의 컬러 팔레트 분석하기
        </button>
      </div>
    </div>
  );
};
