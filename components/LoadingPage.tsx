import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const VERBS = ['Visualizing', 'Analyzing', 'Deliberating', 'Musing', 'Vibing'];

const COLORS = [
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

export const LoadingPage: React.FC = () => {
  const [verbIndex, setVerbIndex] = useState(0);
  const [cards, setCards] = useState<{id: number, color: {hex: string, name: string}, x: number, y: number, rot: number, delay: number}[]>([]);

  useEffect(() => {
    // Verb cycler
    const verbInterval = setInterval(() => {
      setVerbIndex(prev => (prev + 1) % VERBS.length);
    }, 400);

    // Generate positions using Global Random + Exclusion Zone
    const newCards: typeof cards = [];
    const count = 25; 
    const cardW = 160;
    const cardH = 96;
    const maxOverlap = 0.15; 

    // Define Exclusion Zone (Top Left for Text)
    const exW = Math.min(window.innerWidth * 0.75, 800);
    const exH = Math.min(window.innerHeight * 0.45, 400);

    for (let i = 0; i < count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        let bestX = 0;
        let bestY = 0;
        let found = false;

        // Try to find a valid position
        for (let attempt = 0; attempt < 200; attempt++) {
            const x = Math.random() * (window.innerWidth - cardW);
            const y = Math.random() * (window.innerHeight - cardH);

            // Check 1: Exclusion Zone (Text Area)
            if (x < exW && y < exH) {
                continue; // Skip this position
            }

            // Check 2: Overlap with existing cards
            let collision = false;
            for(const p of newCards) {
                const xOverlap = Math.max(0, Math.min(x + cardW, p.x + cardW) - Math.max(x, p.x));
                const yOverlap = Math.max(0, Math.min(y + cardH, p.y + cardH) - Math.max(y, p.y));
                if ((xOverlap * yOverlap) > (cardW * cardH * maxOverlap)) {
                    collision = true;
                    break;
                }
            }

            if (!collision) {
                bestX = x;
                bestY = y;
                found = true;
                break;
            }
        }

        // Fallback
        if (!found) {
             let safeX = Math.random() * (window.innerWidth - cardW);
             let safeY = Math.random() * (window.innerHeight - cardH);
             
             if (safeX < exW && safeY < exH) {
                 if (Math.random() > 0.5) safeX = exW + Math.random() * (window.innerWidth - exW - cardW);
                 else safeY = exH + Math.random() * (window.innerHeight - exH - cardH);
             }
             bestX = safeX;
             bestY = safeY;
        }

        newCards.push({
            id: i,
            color,
            x: bestX, 
            y: bestY, 
            rot: Math.random() * 360,
            // Sequential delay to ensure they fall one by one
            delay: i * 0.15
        });
    }
    setCards(newCards);

    return () => clearInterval(verbInterval);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-[#FDFDFD] overflow-hidden">
      
      {/* Top Left Text */}
      <div className="absolute top-8 left-6 md:left-12 z-50 pointer-events-none mix-blend-multiply max-w-[90vw]">
        <h1 className="text-3xl md:text-5xl lg:text-7xl text-black tracking-tighter leading-[1]">
          <span className="font-light">I'm</span>
          <span className="font-bold ml-3">{VERBS[verbIndex]}</span>
          <span className="font-light">...</span>
        </h1>
        
        <div className="inline-block mt-3 md:mt-5">
            <p className="text-2xl md:text-4xl lg:text-5xl font-light text-black tracking-tighter leading-[1] whitespace-nowrap">
                Your 2025 Color Palette
            </p>
            <div className="w-full h-0.5 md:h-1 bg-gray-200 mt-4 md:mt-5 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-black"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 4.5, ease: "linear" }}
                />
            </div>
        </div>
      </div>

      {/* Falling Cards */}
      {cards.map((card) => (
        <motion.div
          key={card.id}
          initial={{ y: -250, x: card.x, rotate: card.rot }}
          animate={{ 
            y: card.y, 
            x: card.x,
            rotate: card.rot + 10 
          }}
          transition={{ 
            duration: 2.5,
            delay: card.delay,
            ease: "easeOut"
          }}
          className="absolute w-40 h-24 bg-white shadow-lg flex flex-col z-10"
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
    </div>
  );
};