import React, { useCallback, useState, useRef } from "react";
import { Upload, X, ArrowRight, HelpCircle } from "lucide-react";
import { ColorData, PhotoData } from "../types";
import { getTopColors } from "../utils/colorUtils";
import { motion, AnimatePresence } from "framer-motion";
import heic2any from "heic2any";
import { Footer } from "./Footer";

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
  const [hasExceededLimit, setHasExceededLimit] = useState(false);
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
                quality: 0.8,
              });
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
              return null;
            }
          }

          const resizedBlob = await resizeImage(processedFile, 1920);
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

      setPhotos((prev) => {
        const combined = [...prev, ...processedPhotos];
        if (combined.length > 6) {
          setHasExceededLimit(true);
        }
        return combined.slice(0, 6);
      });
      setIsProcessing(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const canAnalyze = photos.length >= 1 && photos.length <= 6;
  const tooManyPhotos = hasExceededLimit;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-12 md:pt-20 bg-gray-50 overflow-auto relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200 opacity-80"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      {/* Privacy Info Button - Fixed Bottom Left */}
      <button
        onClick={() => {
          setPrivacyPopupSource("help");
          setShowPrivacyPopup(true);
        }}
        className="fixed bottom-6 left-6 p-3 bg-white/80 hover:bg-white rounded-full transition-all hover:scale-110 z-50 border border-gray-200/60"
        aria-label="Privacy Information"
      >
        <HelpCircle size={24} className="text-gray-700" strokeWidth={2} />
      </button>

      {/* Privacy Popup */}
      <AnimatePresence>
        {showPrivacyPopup && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyPopup(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-[#FCFAF7] text-[#1A1A1A] p-6 md:p-8 shadow-2xl max-w-md w-full pointer-events-auto border-2 border-[#1A1A1A]"
              >
                <div className="flex flex-col items-center text-center space-y-4 font-mono">
                  <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
                    <HelpCircle size={24} className="text-[#1A1A1A]" />
                  </div>
                  <h3 className="text-xl font-bold uppercase">개인정보 보호</h3>
                  <p className="text-xs leading-relaxed uppercase opacity-80">
                    업로드된 개인 정보와 사진들은
                    <br />
                    <span className="font-bold">
                      어디에도 저장되지 않습니다.
                    </span>
                  </p>
                  <p className="text-xs leading-relaxed uppercase opacity-80">
                    모든 분석은 브라우저에서 진행되며,
                    <br />
                    페이지를 닫으면 데이터가 완전히 삭제됩니다.
                  </p>
                  {privacyPopupSource === "upload" && (
                    <p className="text-xs font-medium leading-relaxed uppercase">
                      분석을 위해 1장 이상의 사진을
                      <br />
                      선택해주세요.
                    </p>
                  )}
                  <button
                    onClick={() => {
                      setShowPrivacyPopup(false);
                      if (privacyPopupSource === "upload") {
                        setTimeout(() => {
                          fileInputRef.current?.click();
                        }, 100);
                      }
                    }}
                    className="bg-[#1A1A1A] text-white px-6 py-2 hover:bg-gray-800 transition-colors font-medium text-sm uppercase"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="relative z-10 w-full px-4 pb-40">
        {/* Receipt Wrapper */}
        <div className="relative w-full max-w-[360px] mx-auto overflow-hidden pb-4 pt-0">
          <div className="relative w-full max-w-[340px] mx-auto">
            {/* The Receipt Paper */}
            <div className="relative bg-[#FCFAF7] text-[#1A1A1A] font-mono px-6 pt-12 pb-16 shadow-lg">
              {/* Subtle Folds/Wrinkles */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-5"
                style={{
                  background:
                    "linear-gradient(175deg, transparent 40%, #000 40%, transparent 43%), linear-gradient(5deg, transparent 60%, #000 60%, transparent 62%)",
                }}
              ></div>

              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-[28px] font-bold tracking-[0.2rem] font-jersey uppercase mb-2 ">
                  Upload Photos
                </h1>
                {/* <p className="text-xs text-gray-500  tracking-widest">
                  photo-receipt.vercel.app
                </p> */}
                <p className="text-xs text-gray-500 mt-2">
                  {`${new Date().toLocaleString("sv-SE").replace("T", " ")}`}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>

              {/* Upload Button */}
              <div className="mb-6">
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
                  className="w-full bg-[#1A1A1A] text-white py-3 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm uppercase font-bold"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">처리중...</span>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>사진 선택하기</span>
                    </>
                  )}
                </button>
              </div>

              {/* Photo Counter */}
              <div className="text-center mb-6">
                <div className="text-xs text-gray-500 uppercase">
                  {photos.length}/6장 선택됨
                </div>
              </div>

              {/* Warning Messages */}
              <AnimatePresence>
                {tooManyPhotos && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-gray-200 border border-[#1A1A1A]/20 text-[#1A1A1A] px-4 py-2 text-center text-xs uppercase mb-6"
                  >
                    선택한 첫 6장까지만 분석에 사용됩니다.
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              {photos.length > 0 && (
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>
              )}

              {/* Preview Grid */}
              {photos.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 uppercase mb-3">
                    Photos ({photos.length})
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <AnimatePresence>
                      {photos.map((photo) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="relative aspect-square bg-gray-100 overflow-hidden group"
                        >
                          <img
                            src={photo.url}
                            alt="upload"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1 right-1 bg-[#1A1A1A] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Divider */}
              {photos.length > 0 && (
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>
              )}

              {/* Analyze Button */}
              <button
                onClick={() => onAnalyze(photos.slice(0, 6))}
                disabled={!canAnalyze}
                className={`w-full py-3 flex items-center justify-center gap-2 text-sm uppercase font-bold transition-all ${
                  canAnalyze
                    ? "bg-[#1A1A1A] text-white hover:bg-gray-800"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <span>분석하기</span>
                <ArrowRight size={16} />
              </button>

              {/* Jagged Bottom Edge */}
              <div
                className="absolute bottom-0 left-0 w-full h-3 bg-[#FCFAF7]"
                style={{
                  clipPath:
                    "polygon(0 0, 3% 50%, 6% 0, 9% 50%, 12% 0, 15% 50%, 18% 0, 21% 50%, 24% 0, 27% 50%, 30% 0, 33% 50%, 36% 0, 39% 50%, 42% 0, 45% 50%, 48% 0, 51% 50%, 54% 0, 57% 50%, 60% 0, 63% 50%, 66% 0, 69% 50%, 72% 0, 75% 50%, 78% 0, 81% 50%, 84% 0, 87% 50%, 90% 0, 93% 50%, 96% 0, 99% 50%, 100% 0, 100% 100%, 0 100%)",
                }}
              ></div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
