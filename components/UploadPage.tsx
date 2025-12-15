import React, { useCallback, useState, useRef } from "react";
import { Upload, X, ArrowRight, HelpCircle } from "lucide-react";
import { ColorData, PhotoData } from "../types";
import { getTopColors } from "../utils/colorUtils";
import { motion, AnimatePresence } from "framer-motion";
import heic2any from "heic2any";

interface UploadPageProps {
  onAnalyze: (photos: PhotoData[]) => void;
}

// Helper function to resize images
const resizeImage = (file: File, maxWidth: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject("Failed to get canvas context");
        return;
      }

      let width = img.width;
      let height = img.height;

      // Only resize if image is larger than maxWidth
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject("Failed to create blob");
          }
        },
        file.type || "image/jpeg",
        0.85
      ); // 85% quality
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const UploadPage: React.FC<UploadPageProps> = ({ onAnalyze }) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [hasExceeded50, setHasExceeded50] = useState(false);
  const [privacyPopupSource, setPrivacyPopupSource] = useState<
    "help" | "upload"
  >("help");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsProcessing(true);
      const newFiles = Array.from(e.target.files) as File[];

      const newPhotosPromises = newFiles.map(async (file) => {
        try {
          let processedFile = file;

          // Convert HEIC to JPEG if needed
          if (
            file.type === "image/heic" ||
            file.type === "image/heif" ||
            file.name.toLowerCase().endsWith(".heic") ||
            file.name.toLowerCase().endsWith(".heif")
          ) {
            try {
              const convertedBlob = await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.8, // Reduced quality for memory optimization
              });
              // heic2any can return Blob or Blob[], handle both cases
              const blob = Array.isArray(convertedBlob)
                ? convertedBlob[0]
                : convertedBlob;
              processedFile = new File(
                [blob],
                file.name.replace(/\.heic$/i, ".jpg"),
                { type: "image/jpeg" }
              );
            } catch (error) {
              console.error(
                "HEIC conversion failed for",
                file.name,
                ":",
                error
              );
              // If conversion fails, skip this file
              return null;
            }
          }

          // OPTIMIZATION: Resize large images to save memory
          const resizedBlob = await resizeImage(processedFile, 1920); // Max 1920px width
          const resizedFile = new File([resizedBlob], processedFile.name, {
            type: processedFile.type,
          });

          const url = URL.createObjectURL(resizedFile);
          const topColors = await getTopColors(url, 5);
          return {
            id: Math.random().toString(36).substring(7),
            file: resizedFile,
            url,
            topColors,
          };
        } catch (error) {
          console.error("Failed to process image", file.name, ":", error);
          return null;
        }
      });

      const processedPhotos = (await Promise.all(newPhotosPromises)).filter(
        (
          p
        ): p is PhotoData & {
          topColors: {
            colors: ColorData[];
            scoredColors: { color: ColorData; score: number }[];
          };
        } => p !== null
      );
      // Limit to 50 photos total
      setPhotos((prev) => {
        const combined = [...prev, ...processedPhotos];
        if (combined.length > 50) {
          setHasExceeded50(true);
        }
        return combined.slice(0, 50);
      });
      setIsProcessing(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const canAnalyze = photos.length >= 1 && photos.length <= 50;
  const tooFewPhotos = photos.length > 0 && photos.length < 1;
  const tooManyPhotos = hasExceeded50;

  return (
    <div className="h-[100dvh] bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Privacy Info Button - Bottom Left */}
      <button
        onClick={() => {
          setPrivacyPopupSource("help");
          setShowPrivacyPopup(true);
        }}
        className="absolute bottom-6 left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 z-50 border border-white/20"
        aria-label="Privacy Information"
      >
        <HelpCircle size={28} className="text-white" strokeWidth={2} />
      </button>

      {/* Privacy Popup */}
      <AnimatePresence>
        {showPrivacyPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyPopup(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />

            {/* Popup */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white text-black p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full pointer-events-auto"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <HelpCircle size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold">개인정보 보호</h3>
                  <p className="text-gray-600 leading-relaxed">
                    업로드된 개인 정보와 사진들은
                    <br />
                    <span className="font-bold text-black">
                      어디에도 저장되지 않습니다.
                    </span>
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    모든 분석은 브라우저에서 진행되며,
                    <br />
                    페이지를 닫으면 데이터가 완전히 삭제됩니다.
                  </p>
                  {privacyPopupSource === "upload" && (
                    <p className="text-green-600 font-medium leading-relaxed">
                      분석을 위해 1장 이상의 사진을
                      <br />
                      선택해주세요.
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setShowPrivacyPopup(false);
                      // If opened from upload button, trigger file selection
                      if (privacyPopupSource === "upload") {
                        setTimeout(() => {
                          fileInputRef.current?.click();
                        }, 100);
                      }
                    }}
                    className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-4xl w-full flex flex-col items-center text-center space-y-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 w-full"
        >
          {/* Updated Title: Capital M, Light font */}
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight whitespace-nowrap">
            Upload Your Moments
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full flex justify-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => {
              setPrivacyPopupSource("upload");
              setShowPrivacyPopup(true);
            }}
            className="group cursor-pointer relative"
          >
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
          </button>
        </motion.div>

        <div className="text-sm text-gray-500 font-mono">
          {photos.length}/50장 선택됨
        </div>

        {/* Warning Messages */}
        <AnimatePresence>
          {tooFewPhotos && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg text-sm"
            >
              분석하기 위해서는 1장 이상 선택해주세요.
            </motion.div>
          )}
          {tooManyPhotos && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm"
            >
              선택한 첫 50장까지만 분석에 사용됩니다.
            </motion.div>
          )}
        </AnimatePresence>

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
                <img
                  src={photo.url}
                  alt="upload"
                  className="w-full h-full object-cover"
                />
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
            pointerEvents: canAnalyze ? "auto" : "none",
          }}
          className="flex flex-col items-center gap-2"
        >
          <button
            onClick={() => onAnalyze(photos.slice(0, 50))}
            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-full transition-colors shadow-lg font-bold border-2 border-transparent"
            disabled={!canAnalyze}
          >
            <span>분석하기</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};
