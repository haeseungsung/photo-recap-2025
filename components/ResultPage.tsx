import React, { useState, useRef, useMemo, useEffect } from 'react';
import { PhotoData, PaletteResult, ColorData } from '../types';
import { colorDistance } from '../utils/colorUtils';
import html2canvas from 'html2canvas';
import { RefreshCw, Share2, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResultPageProps {
  photos: PhotoData[];
  palette: PaletteResult;
  onRetry: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ photos, palette, onRetry }) => {
  const [activeColor, setActiveColor] = useState<ColorData | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  
  const captureRef = useRef<HTMLDivElement>(null);

  // Use only 50% of photos for the collage
  const displayPhotos = useMemo(() => photos.slice(0, Math.ceil(photos.length * 0.5)), [photos]);

  // Filter photos for Detail View:
  // Only include photos that have a "close" connection (Delta E < 45) to at least one palette color.
  // This ensures every photo shown connects to the palette.
  const detailPhotos = useMemo(() => {
    const threshold = 45; // Delta E threshold for "connection"
    const filtered = photos.filter(photo => {
      // Check if ANY palette color is close enough
      return palette.colors.some(c => colorDistance(photo.dominantColor, c) < threshold);
    });
    
    // Safety fallback: if filter removes everything (unlikely), return original photos
    return filtered.length > 0 ? filtered : photos;
  }, [photos, palette.colors]);

  // Reset index when entering detail view
  useEffect(() => {
    if (isDetailView) {
        setCurrentDetailIndex(0);
    }
  }, [isDetailView]);

  const handleShare = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
            scale: 2, // High res
            backgroundColor: '#f9fafb', // Match bg-gray-50
            useCORS: true // Important for images
        });
        const link = document.createElement('a');
        link.download = isDetailView ? 'my-2025-palette-detail.png' : 'my-2025-palette-collage.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error("Capture failed", err);
      }
    }
  };

  // Determine which photos to highlight based on activeColor (for Collage View)
  const highlightedIds = useMemo(() => {
    if (!activeColor) return new Set<string>();

    const withDist = displayPhotos.map(p => ({
        id: p.id,
        dist: colorDistance(p.dominantColor, activeColor)
    }));
    
    withDist.sort((a, b) => a.dist - b.dist);
    const topIds = withDist.slice(0, 5).map(x => x.id);
    return new Set(topIds);
  }, [activeColor, displayPhotos]);

  const isDimmed = (id: string) => {
    if (!activeColor) return false;
    return !highlightedIds.has(id);
  };

  // Pre-calculate non-overlapping positions for collage
  const photoPositions = useMemo(() => {
    const positions: {top: number, left: number, width: number, height: number, rotation: number, zIndex: number}[] = [];
    const containerAspect = 3/4; 
    
    // Size: ~20% width
    const itemW = 20; 
    const itemH = itemW * containerAspect; 

    displayPhotos.forEach(() => {
      let bestPos = { top: 0, left: 0 };
      let found = false;
      
      for (let attempt = 0; attempt < 200; attempt++) {
        // Evenly distribute across entire container (100%)
        const left = 2 + Math.random() * (96 - itemW);
        const top = 2 + Math.random() * (96 - itemH);
        
        let valid = true;
        for (const p of positions) {
            const xOverlap = Math.max(0, Math.min(left + itemW, p.left + itemW) - Math.max(left, p.left));
            const yOverlap = Math.max(0, Math.min(top + itemH, p.top + itemH) - Math.max(top, p.top));
            const overlapArea = xOverlap * yOverlap;
            const itemArea = itemW * itemH;
            
            if (overlapArea > (itemArea * 0.2)) {
                valid = false;
                break;
            }
        }

        if (valid) {
            bestPos = { top, left };
            found = true;
            break;
        }
      }

      if (!found) {
         bestPos = {
             left: 2 + Math.random() * (96 - itemW),
             top: 2 + Math.random() * (96 - itemH)
         };
      }

      positions.push({
        ...bestPos,
        width: itemW,
        height: itemH,
        rotation: (Math.random() * 30) - 15,
        zIndex: Math.floor(Math.random() * 20) + 10
      });
    });

    return positions;
  }, [displayPhotos]);

  // --- Detail View Logic ---
  
  const handleNextDetailPhoto = () => {
    setCurrentDetailIndex(prev => (prev + 1) % detailPhotos.length);
  };
  
  const handlePrevDetailPhoto = () => {
    setCurrentDetailIndex(prev => (prev - 1 + detailPhotos.length) % detailPhotos.length);
  };

  // Identify highlight colors based on CURRENT filtered photo
  const highlightedPaletteIndices = useMemo(() => {
    if (detailPhotos.length === 0) return new Set();
    const currentPhoto = detailPhotos[currentDetailIndex];
    if (!currentPhoto) return new Set();

    const distances = palette.colors.map((color, i) => ({
        index: i,
        dist: colorDistance(currentPhoto.dominantColor, color)
    }));
    
    distances.sort((a, b) => a.dist - b.dist);
    
    // Always include the closest
    const result = new Set<number>();
    
    // Add close matches (Delta E < 40)
    // Since we filtered photos to ensure at least one match < 45, this will basically always yield results.
    distances.forEach(d => {
        if (d.dist < 40) {
            result.add(d.index);
        }
    });

    // Fallback: if somehow nothing matches (due to filter edge case), take the absolute closest
    if (result.size === 0) {
        result.add(distances[0].index);
    }
    
    return result;
  }, [currentDetailIndex, detailPhotos, palette.colors]);

  return (
    <div className="h-[100dvh] bg-gray-50 text-black p-2 md:p-4 flex flex-col items-center overflow-hidden">

      {/* Action Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-2 md:mb-4 z-50 shrink-0">
        <button onClick={onRetry} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <RefreshCw size={20} />
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg active:scale-95 text-sm">
          <Share2 size={16} />
          <span className="font-medium">Save</span>
        </button>
      </div>

      {/* Main Content Area (Capture Target) - 80% height */}
      <div
        ref={captureRef}
        className="w-full max-w-[1200px] h-[80%] bg-white relative overflow-hidden flex flex-col justify-between shadow-2xl border border-gray-100 isolate shrink-0"
      >
        {isDetailView ? (
          // --- Detail View Content ---
          <div className="absolute inset-0 z-50 bg-white flex flex-col">

             {/* TOP: Palette Row */}
             <div className="w-full h-[140px] bg-white border-b border-gray-100 flex items-center justify-center gap-2 md:gap-4 px-4 shrink-0 z-20">
                {palette.colors.map((color, idx) => {
                     const isActive = highlightedPaletteIndices.has(idx);
                     return (
                         <motion.div 
                             key={idx}
                             animate={{ 
                                 opacity: isActive ? 1 : 0.2, // Stronger dimming for inactive
                                 scale: isActive ? 1.05 : 0.95,
                                 y: isActive ? 0 : 5
                             }}
                             className="flex flex-col items-center"
                         >
                             <div 
                                 className="w-12 h-16 md:w-16 md:h-20 shadow-sm" // Vertical rectangular chips
                                 style={{ backgroundColor: color.hex }}
                             />
                             <span className={`text-[10px] uppercase tracking-widest mt-2 font-mono ${isActive ? 'text-black font-bold' : 'text-gray-300'}`}>
                                 {color.hex}
                             </span>
                         </motion.div>
                     );
                 })}
             </div>

             {/* BOTTOM: Main Photo Area */}
             <div className="flex-1 relative bg-gray-50 flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
                <div className="flex-1 w-full flex items-center justify-center relative">
                  <AnimatePresence mode="wait">
                      {detailPhotos[currentDetailIndex] && (
                          <motion.div
                              key={detailPhotos[currentDetailIndex].id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              transition={{ duration: 0.4 }}
                              className="w-full h-full flex items-center justify-center relative z-10"
                          >
                              <img
                                  src={detailPhotos[currentDetailIndex].url}
                                  alt="Detail"
                                  className="max-w-full max-h-full object-contain shadow-xl"
                              />
                          </motion.div>
                      )}
                  </AnimatePresence>

                  {/* Manual Navigation Buttons (Overlay) */}
                  <button
                      onClick={handlePrevDetailPhoto}
                      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 hover:bg-white text-black transition-colors z-20"
                  >
                      <ChevronLeft size={32} />
                  </button>
                  <button
                      onClick={handleNextDetailPhoto}
                      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/50 hover:bg-white text-black transition-colors z-20"
                  >
                      <ChevronRight size={32} />
                  </button>
                </div>

                {/* Bottom Navigation Dots - Horizontal */}
                <div className="flex gap-2 mt-4 z-20 max-w-full overflow-x-auto scrollbar-hide px-2">
                     {detailPhotos.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentDetailIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                                idx === currentDetailIndex
                                ? 'bg-black scale-150 ring-2 ring-gray-200'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        />
                     ))}
                </div>

             </div>
          </div>
        ) : (
          // --- Collage View Content ---
          <>
            {/* Collage Layer - 65% height */}
            <div className="absolute inset-0 z-0 p-8">
              <div className="w-full h-[65%] relative">
                {displayPhotos.map((photo, index) => {
                  const pos = photoPositions[index];
                  const dimmed = isDimmed(photo.id);
                  
                  return (
                    <motion.div
                      drag
                      dragMomentum={false}
                      dragConstraints={captureRef}
                      key={photo.id}
                      whileHover={{ scale: 1.1, zIndex: 100 }}
                      whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
                      className="absolute shadow-sm cursor-grab active:cursor-grabbing pointer-events-auto"
                      style={{
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                        rotate: pos.rotation,
                        width: '20%', 
                        opacity: dimmed ? 0.1 : 1,
                        filter: dimmed ? 'grayscale(100%)' : 'none',
                        zIndex: dimmed ? 1 : pos.zIndex
                      }}
                    >
                      <div className="bg-white p-1 shadow-sm">
                         <img src={photo.url} alt="" className="w-full h-auto pointer-events-none select-none block" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Palette & Info Section - Left Aligned (Safe Zone Protected) */}
            <div className="z-30 relative mt-auto flex flex-col items-start w-full p-8 md:p-12 bg-transparent pointer-events-none select-none">
                
                {/* Title & Tags */}
                <div className="mb-6 text-left pointer-events-auto">
                    <h2 className="text-3xl md:text-5xl font-light text-black mb-3 tracking-tight leading-tight">
                        {palette.title}
                    </h2>
                    <div className="flex flex-wrap gap-3 text-gray-500 text-sm font-light tracking-wide">
                        {palette.hashtags.map(tag => (
                            <span key={tag} className="">{tag}</span>
                        ))}
                    </div>
                </div>

                {/* Color Swatches */}
                <div className="flex gap-3 pointer-events-auto">
                    {palette.colors.map((color, idx) => (
                        <button
                            key={idx}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg hover:-translate-y-1 transition-transform duration-300 border-2 border-white focus:outline-none ring-1 ring-black/5"
                            style={{ backgroundColor: color.hex }}
                            onMouseEnter={() => setActiveColor(color)}
                            onMouseLeave={() => setActiveColor(null)}
                            onClick={() => setActiveColor(activeColor === color ? null : color)}
                        />
                    ))}
                </div>
            </div>
          </>
        )}
      </div>

      {/* View Toggle Button - Outside the capture card */}
      <div className="mt-4 mb-2 z-50 shrink-0">
        {!isDetailView ? (
          <button
              onClick={() => setIsDetailView(true)}
              className="bg-black text-white px-8 py-3 rounded-full text-base font-bold shadow-xl hover:scale-105 transition-all hover:bg-gray-900 active:scale-95"
          >
              팔레트 자세히 보기
          </button>
        ) : (
          <button
              onClick={() => setIsDetailView(false)}
              className="bg-black text-white px-8 py-3 rounded-full text-base font-bold shadow-xl hover:scale-105 transition-all hover:bg-gray-900 active:scale-95"
          >
              돌아가기
          </button>
        )}
      </div>

    </div>
  );
};