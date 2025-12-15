import React, { useState, useMemo, useEffect } from "react";
import { PhotoData, PaletteResult, ColorData } from "../types";
import { applyPaletteFilter, colorDistance } from "../utils/colorUtils";
import { RefreshCw, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

interface ResultPageProps {
  photos: PhotoData[];
  palette: PaletteResult;
  onRetry: () => void;
}

// Helper function to find the closest palette color for a given color
const findClosestPaletteColor = (
  color: ColorData,
  paletteColors: ColorData[]
): number => {
  let minDistance = Infinity;
  let closestIndex = 0;

  paletteColors.forEach((paletteColor, index) => {
    const distance = colorDistance(color, paletteColor);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
};

export const ResultPage: React.FC<ResultPageProps> = ({
  photos,
  palette,
  onRetry,
}) => {
  const [filteredPhotoUrls, setFilteredPhotoUrls] = useState<{
    [photoId: string]: string;
  }>({});
  const captureRef = React.useRef<HTMLDivElement>(null);

  const paletteColors = palette?.colors || [];
  const validPhotos = Array.isArray(photos) ? photos : [];

  // Calculate color percentages based on actual photo color distribution
  const colorPercentages = useMemo(() => {
    if (paletteColors.length === 0 || validPhotos.length === 0) {
      return paletteColors.map(() => 0);
    }

    // Count how many times each palette color is the closest match
    const counts = new Array(paletteColors.length).fill(0);

    validPhotos.forEach((photo) => {
      if (photo.topColors && photo.topColors.colors) {
        // For each photo, count all its top colors
        photo.topColors.colors.forEach((color) => {
          const closestIndex = findClosestPaletteColor(color, paletteColors);
          counts[closestIndex]++;
        });
      }
    });

    // Calculate total and percentages
    const total = counts.reduce((sum, count) => sum + count, 0);

    if (total === 0) {
      // Fallback to equal distribution
      const equalPercentage = 100 / paletteColors.length;
      return paletteColors.map(() => Math.round(equalPercentage));
    }

    // Calculate percentages and ensure they sum to 100
    const percentages = counts.map((count) =>
      Math.round((count / total) * 100)
    );

    // Adjust to ensure sum is exactly 100
    const sum = percentages.reduce((a, b) => a + b, 0);
    if (sum !== 100 && percentages.length > 0) {
      const diff = 100 - sum;
      // Find the index with the highest count to adjust
      const maxIndex = counts.indexOf(Math.max(...counts));
      percentages[maxIndex] += diff;
    }

    return percentages;
  }, [paletteColors, validPhotos]);

  // Apply palette filter to photos
  useEffect(() => {
    validPhotos.forEach((photo) => {
      if (!filteredPhotoUrls[photo.id] && photo && photo.url) {
        applyPaletteFilter(photo.url, paletteColors, 15, 0.18, 15)
          .then((filteredUrl) => {
            if (filteredUrl) {
              setFilteredPhotoUrls((prev) => ({
                ...prev,
                [photo.id]: filteredUrl,
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
        const link = document.createElement("a");
        link.download = "my-2025-palette.png";
        link.href = canvas.toDataURL();
        link.click();
      } catch (err) {
        console.error("Capture failed", err);
      }
    }
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

      {/* Action Buttons - Top */}
      <div className="fixed top-8 left-8 z-50 flex gap-2">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full hover:bg-white transition-colors border border-gray-200/60 active:scale-95 text-sm"
        >
          <RefreshCw size={16} />
          <span className="font-medium">Retry</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full hover:bg-white transition-colors border border-gray-200/60 active:scale-95 text-sm"
        >
          <Share2 size={16} />
          <span className="font-medium">Save</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 w-full px-4 pb-20">
        {/* Receipt Wrapper */}
        <div
          ref={captureRef}
          className="relative w-full max-w-[600px] mx-auto overflow-hidden pb-4 pt-0"
        >
          <div className="relative w-full max-w-[580px] mx-auto">
            {/* The Receipt Paper */}
            <div className="relative bg-[#FCFAF7] text-[#1A1A1A] font-mono px-8 pt-12 pb-16 shadow-lg">
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
                <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
                  Color Receipt
                </h1>
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                  Your 2025 Palette
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date()
                    .toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    .toUpperCase()}
                  <br />
                  {new Date().toLocaleTimeString("en-US", {
                    hour12: false,
                  })}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>

              {/* Photo Grid */}
              <div className="mb-8">
                <div className="text-xs text-gray-500 uppercase mb-3">
                  Photos ({validPhotos.length})
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {validPhotos.slice(0, 6).map((photo) => {
                    const displayUrl = filteredPhotoUrls[photo.id] || photo.url;
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
                  <span>Color</span>
                  <span>Amount</span>
                </div>
                {paletteColors.map((color, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md ring-1 ring-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs text-gray-500 font-sans tracking-wider">
                        {color.hex}
                      </span>
                    </div>
                    <div className="font-bold">{colorPercentages[index]}%</div>
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
              <div className="text-center space-y-2">
                <div
                  className="h-12 w-3/4 mx-auto bg-[#1A1A1A] opacity-90"
                  style={{
                    maskImage:
                      "linear-gradient(90deg, transparent 2%, black 2%, black 4%, transparent 4%, transparent 6%, black 6%, black 10%, transparent 10%, transparent 12%, black 12%, black 18%, transparent 18%, transparent 20%, black 20%, black 22%, transparent 22%, transparent 26%, black 26%, black 30%, transparent 30%, transparent 34%, black 34%, black 36%, transparent 36%, transparent 40%, black 40%, black 45%, transparent 45%, transparent 48%, black 48%, black 55%, transparent 55%, transparent 60%, black 60%, black 65%, transparent 65%, transparent 70%, black 70%, black 80%, transparent 80%, transparent 85%, black 85%, black 90%, transparent 90%, transparent 95%, black 95%)",
                  }}
                ></div>
                <p className="text-[10px] uppercase tracking-[0.2em]">
                  Thank You
                </p>
              </div>

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

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 w-full text-center z-10 opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
          Photo Recap 2025 / Color Analysis
        </p>
      </footer>
    </div>
  );
};
