import React, { useState, useMemo, useEffect } from "react";
import { PhotoData, PaletteResult } from "../types";
import { applyPaletteFilter } from "../utils/colorUtils";
import { RefreshCw, Share2 } from "lucide-react";
import html2canvas from "html2canvas";
import BarcodeIcon from "./BarcodeIcon";

interface ResultPageProps {
  photos: PhotoData[];
  palette: PaletteResult;
  onRetry: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  photos,
  palette,
  onRetry,
}) => {
  const [filteredPhotoUrls, setFilteredPhotoUrls] = useState<{
    [photoId: string]: string;
  }>({});
  const [photoColorCounts, setPhotoColorCounts] = useState<{
    [photoId: string]: number[];
  }>({});
  const [isPrinting, setIsPrinting] = useState(false);
  const captureRef = React.useRef<HTMLDivElement>(null);

  const paletteColors = palette?.colors || [];
  const validPhotos = Array.isArray(photos) ? photos : [];

  // Start printing animation on mount
  useEffect(() => {
    const printTimer = setTimeout(() => {
      setIsPrinting(true);
    }, 100);

    return () => {
      clearTimeout(printTimer);
    };
  }, []);

  // Calculate color percentages based on actual photo color distribution
  const colorPercentages = useMemo(() => {
    if (paletteColors.length === 0 || validPhotos.length === 0) {
      return paletteColors.map(() => 0);
    }

    // Sum up color counts from all photos
    const totalCounts = new Array(paletteColors.length).fill(0);

    validPhotos.forEach((photo) => {
      const counts = photoColorCounts[photo.id];
      if (counts && counts.length === paletteColors.length) {
        counts.forEach((count, index) => {
          totalCounts[index] += count;
        });
      }
    });

    // Calculate total and percentages
    const total = totalCounts.reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      // Fallback to equal distribution
      const equalPercentage = 100 / paletteColors.length;
      return paletteColors.map(() => Math.round(equalPercentage));
    }

    // Calculate percentages and ensure they sum to 100
    const percentages = totalCounts.map((count) =>
      Math.round((count / total) * 100)
    );

    // Adjust to ensure sum is exactly 100
    const sum = percentages.reduce((a, b) => a + b, 0);
    if (sum !== 100 && percentages.length > 0) {
      const diff = 100 - sum;
      // Find the index with the highest count to adjust
      const maxIndex = totalCounts.indexOf(Math.max(...totalCounts));
      percentages[maxIndex] += diff;
    }

    return percentages;
  }, [paletteColors, validPhotos, photoColorCounts]);

  // Apply palette filter to photos
  useEffect(() => {
    validPhotos.forEach((photo) => {
      if (!filteredPhotoUrls[photo.id] && photo && photo.url) {
        applyPaletteFilter(photo.url, paletteColors, 15, 0.18, 15)
          .then((result) => {
            if (result && result.url) {
              setFilteredPhotoUrls((prev) => ({
                ...prev,
                [photo.id]: result.url,
              }));
              setPhotoColorCounts((prev) => ({
                ...prev,
                [photo.id]: result.colorCounts,
              }));
            }
          })
          .catch((err) => {
            console.error("Filter failed for", photo.id, err);
          });
      }
    });
  }, [validPhotos, paletteColors]);

  const handleShare = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
          scale: 2,
          backgroundColor: "#f9fafb",
          useCORS: true,
        });

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (!blob) return;

          const file = new File([blob], "my-2025-palette.png", {
            type: "image/png",
          });

          // Check if Web Share API is supported (mainly mobile)
          if (navigator.share && navigator.canShare?.({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: "My 2025 Color Palette",
                text: "Check out my 2025 color palette! 🎨",
              });
            } catch (err) {
              // User cancelled or share failed, fallback to download
              if ((err as Error).name !== "AbortError") {
                downloadImage(canvas);
              }
            }
          } else {
            // Fallback to download for desktop or unsupported browsers
            downloadImage(canvas);
          }
        }, "image/png");
      } catch (err) {
        console.error("Capture failed", err);
      }
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    const link = document.createElement("a");
    link.download = "my-2025-palette.png";
    link.href = canvas.toDataURL();
    link.click();
  };

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

      {/* Main Content Area */}
      <main className="relative z-10 w-full px-4 pb-20">
        {/* Receipt Wrapper */}
        <div className="relative w-full max-w-[360px] mx-auto overflow-hidden pb-4 pt-0">
          <div className="relative w-full max-w-[340px] mx-auto perspective-1000">
            {/* Animation Container */}
            <div
              ref={captureRef}
              className={`transform transition-transform duration-[2500ms] ease-linear will-change-transform ${
                isPrinting ? "translate-y-0" : "-translate-y-full"
              }`}
            >
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
                <div className="text-center mb-8 relative">
                  {/* Retry Button - Top Right */}

                  <div className="flex justify-center items-center pb-2 gap-1">
                    <h1 className="text-2xl font-bold tracking-tighter uppercase ">
                      Color Receipt
                    </h1>
                    <button
                      onClick={onRetry}
                      className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      aria-label="Retry"
                    >
                      <RefreshCw size={14} className="text-gray-600" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">
                    Your 2025 Palette
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {`${new Date().toLocaleString("sv-SE").replace("T", " ")}`}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>

                {/* Photo Grid */}
                <div className="mb-8">
                  <div className="text-xs text-gray-500 uppercase mb-3">
                    Photos ({validPhotos.length})
                  </div>
                  <div
                    className={`grid gap-2 ${
                      validPhotos.length < 2
                        ? "grid-cols-1"
                        : validPhotos.length === 2 || validPhotos.length === 4
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {validPhotos.slice(0, 6).map((photo) => {
                      const displayUrl =
                        filteredPhotoUrls[photo.id] || photo.url;
                      return (
                        <div
                          key={photo.id}
                          className="aspect-square bg-gray-100 overflow-hidden"
                        >
                          <img
                            src={displayUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (displayUrl !== photo.url) {
                                e.currentTarget.src = photo.url;
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>

                {/* Color Palette List */}
                <div className="flex flex-col gap-3 mb-8 text-sm">
                  <div className="flex justify-between text-xs text-gray-500 uppercase mb-1">
                    <span>HEX</span>
                    <span>Amount</span>
                  </div>
                  {paletteColors.map((color, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-6 rounded-full border-2 border-white ring-1 ring-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs text-gray-500 font-mono tracking-wider">
                          {color.hex}
                        </span>
                      </div>
                      <div className="font-bold">
                        {colorPercentages[index]}%
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>

                {/* Total Section */}
                <div className="flex justify-between items-end mb-8 font-bold text-lg">
                  <span>TOTAL</span>
                  <span>100%</span>
                </div>

                {/* Barcode */}
                <button
                  onClick={handleShare}
                  className="w-full text-center space-y-2 transition-all duration-300 "
                >
                  <div className="w-3/4 mx-auto flex justify-center">
                    <BarcodeIcon height={80} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2em]">
                    Save Your Receipt
                  </p>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 w-full text-center z-10 opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
          Photo Recap 2025 / Color Analysis
        </p>
      </footer>
    </div>
  );
};
