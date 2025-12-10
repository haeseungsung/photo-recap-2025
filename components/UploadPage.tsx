import React, { useCallback, useState } from 'react';
import { Upload, X, ArrowRight } from 'lucide-react';
import { PhotoData } from '../types';
import { getDominantColor } from '../utils/colorUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadPageProps {
  onAnalyze: (photos: PhotoData[]) => void;
}

export const UploadPage: React.FC<UploadPageProps> = ({ onAnalyze }) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const newFiles = Array.from(e.target.files) as File[];
      
      const newPhotosPromises = newFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        const dominantColor = await getDominantColor(url);
        return {
          id: Math.random().toString(36).substring(7),
          file,
          url,
          dominantColor
        };
      });

      const processedPhotos = await Promise.all(newPhotosPromises);
      setPhotos(prev => [...prev, ...processedPhotos]);
      setIsProcessing(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const canAnalyze = photos.length >= 20;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 w-full"
        >
          {/* Updated Title: Capital M, Light font */}
          <h2 className="text-4xl md:text-6xl font-light tracking-tight whitespace-nowrap">Upload 2025 Moments</h2>
          <p className="text-gray-400">20~50장의 사진을 선택해주세요</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full flex justify-center"
        >
            <label className="group cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="bg-white text-black px-12 py-4 rounded-full text-lg font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center gap-2">
                {isProcessing ? (
                  <span className="animate-pulse">처리중...</span>
                ) : (
                  <>
                    <Upload size={20} />
                    <span>사진 선택하기</span>
                  </>
                )}
              </div>
            </label>
        </motion.div>

        <div className="text-sm text-gray-500 font-mono">
          {photos.length}/50장 선택됨
        </div>

        {/* Preview Grid */}
        <div className="w-full max-h-[40vh] overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-4 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm scrollbar-hide">
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="relative aspect-square rounded-md overflow-hidden group"
              >
                <img src={photo.url} alt="upload" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
            {photos.length === 0 && (
               <div className="col-span-full h-32 flex items-center justify-center text-gray-700">
                 No photos selected yet
               </div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          animate={{ 
            opacity: canAnalyze ? 1 : 0.3,
            y: canAnalyze ? 0 : 10,
            pointerEvents: canAnalyze ? 'auto' : 'none'
          }}
          className="flex flex-col items-center gap-2"
        >
          <button
            onClick={() => onAnalyze(photos)}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full transition-colors shadow-lg font-bold border-2 border-transparent"
            disabled={!canAnalyze}
          >
            <span>분석하기</span>
            <ArrowRight size={18} />
          </button>
          {!canAnalyze && photos.length > 0 && (
            <p className="text-xs text-red-400">최소 20장의 사진이 필요합니다.</p>
          )}
        </motion.div>

      </div>
    </div>
  );
};