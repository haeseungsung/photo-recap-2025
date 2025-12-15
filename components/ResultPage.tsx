import React, { useState, useRef, useMemo, useEffect } from "react";
import { PhotoData, PaletteResult, ColorData } from "../types";
import { colorDistance, applyPaletteFilter } from "../utils/colorUtils";
import html2canvas from "html2canvas";
import {
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Edit2,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultPageProps {
  photos: PhotoData[];
  palette: PaletteResult;
  onRetry: () => void;
}

// Helper function to get the best matching color from topColors
// If palette colors are provided, returns the color closest to any palette color
// Otherwise, returns the first color
const getBestColor = (
  topColors: ColorData[],
  paletteColors?: ColorData[]
): ColorData => {
  if (topColors.length === 0) {
    // Fallback: return a default color
    return { r: 128, g: 128, b: 128, hex: "#808080" };
  }

  if (!paletteColors || paletteColors.length === 0) {
    return topColors[0];
  }

  // Find the color from topColors that is closest to any palette color
  let bestColor = topColors[0];
  let minDistance = Infinity;

  for (const topColor of topColors) {
    const minDistToPalette = Math.min(
      ...paletteColors.map((paletteColor) =>
        colorDistance(topColor, paletteColor)
      )
    );
    if (minDistToPalette < minDistance) {
      minDistance = minDistToPalette;
      bestColor = topColor;
    }
  }

  return bestColor;
};

export const ResultPage: React.FC<ResultPageProps> = ({
  photos,
  palette,
  onRetry,
}) => {
  const [activeColor, setActiveColor] = useState<ColorData | null>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [currentDetailIndex, setCurrentDetailIndex] = useState(0);
  const [imageAspectRatios, setImageAspectRatios] = useState<{
    [key: string]: number;
  }>({});
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(palette?.title || "");
  const [showEditIconHint, setShowEditIconHint] = useState(true);
  const [showHelpPopup, setShowHelpPopup] = useState(false);
  const [filteredPhotoUrls, setFilteredPhotoUrls] = useState<{
    [photoId: string]: string;
  }>({});

  // Validate palette data - return error UI if invalid
  const paletteColors = palette?.colors || [];
  const validPhotos = Array.isArray(photos) ? photos : [];

  if (!palette || !Array.isArray(paletteColors) || paletteColors.length === 0) {
    return (
      <div className="h-[100dvh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            팔레트 데이터를 불러올 수 없습니다.
          </p>
          <button
            onClick={onRetry}
            className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const captureRef = useRef<HTMLDivElement>(null);

  // Hide edit icon hint after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEditIconHint(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Select best 9 photos based on closest color distance to palette
  const displayPhotos = useMemo(() => {
    if (validPhotos.length === 0) {
      console.warn("No valid photos available");
      return [];
    }
    // Calculate the minimum distance from each photo to any palette color
    const photosWithDistance = validPhotos
      .filter(
        (photo) => photo && photo.topColors && Array.isArray(photo.topColors)
      )
      .map((photo) => {
        const bestColor = getBestColor(photo.topColors || [], paletteColors);
        const minDistance = Math.min(
          ...paletteColors.map((color) => colorDistance(bestColor, color))
        );
        return { photo, minDistance };
      });

    if (photosWithDistance.length === 0) {
      console.warn("No photos passed the filter");
      // Fallback: return first 9 photos if filtering removes everything
      return validPhotos.slice(0, 9);
    }

    // Sort by distance (closest first) and take top 9
    photosWithDistance.sort((a, b) => a.minDistance - b.minDistance);
    const result = photosWithDistance.slice(0, 9).map((item) => item.photo);
    console.log("displayPhotos:", result.length, "photos selected");
    return result;
  }, [validPhotos, paletteColors]);

  // Filter photos for Detail View:
  // Only include photos that have a "close" connection (Delta E < 45) to at least one palette color.
  // This ensures every photo shown connects to the palette.
  const detailPhotos = useMemo(() => {
    if (validPhotos.length === 0) return [];
    const threshold = 45; // Delta E threshold for "connection"
    const filtered = validPhotos
      .filter(
        (photo) => photo && photo.topColors && Array.isArray(photo.topColors)
      )
      .filter((photo) => {
        const bestColor = getBestColor(photo.topColors || [], paletteColors);
        // Check if ANY palette color is close enough
        return paletteColors.some(
          (c) => colorDistance(bestColor, c) < threshold
        );
      });

    // Safety fallback: if filter removes everything (unlikely), return original photos
    return filtered.length > 0 ? filtered : validPhotos;
  }, [validPhotos, paletteColors]);

  // Reset index when entering detail view
  useEffect(() => {
    if (isDetailView) {
      setCurrentDetailIndex(0);
    }
  }, [isDetailView]);

  // Load image aspect ratios
  useEffect(() => {
    detailPhotos.forEach((photo) => {
      if (photo && photo.id && photo.url && !imageAspectRatios[photo.id]) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          setImageAspectRatios((prev) => ({
            ...prev,
            [photo.id]: aspectRatio,
          }));
        };
        img.onerror = () => {
          // Set a default aspect ratio if image fails to load
          setImageAspectRatios((prev) => ({
            ...prev,
            [photo.id]: 1,
          }));
        };
        img.src = photo.url;
      }
    });
  }, [detailPhotos]);

  // Apply palette filter to all photos
  useEffect(() => {
    // Filter both displayPhotos (grid) and detailPhotos
    const allPhotosToFilter = new Set([...displayPhotos, ...detailPhotos]);

    allPhotosToFilter.forEach((photo) => {
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
            // On error, the component will fall back to using photo.url
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayPhotos, detailPhotos, paletteColors]);

  const handleShare = async () => {
    if (captureRef.current) {
      try {
        const canvas = await html2canvas(captureRef.current, {
          scale: 2, // High res
          backgroundColor: "#f9fafb", // Match bg-gray-50
          useCORS: true, // Important for images
        });
        const link = document.createElement("a");
        link.download = isDetailView
          ? "my-2025-palette-detail.png"
          : "my-2025-palette-collage.png";
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

    const withDist = displayPhotos
      .filter((p) => p && p.topColors && Array.isArray(p.topColors))
      .map((p) => {
        const bestColor = getBestColor(p.topColors || [], paletteColors);
        return {
          id: p.id,
          dist: colorDistance(bestColor, activeColor),
        };
      });

    withDist.sort((a, b) => a.dist - b.dist);
    const topIds = withDist.slice(0, 5).map((x) => x.id);
    return new Set(topIds);
  }, [activeColor, displayPhotos, paletteColors]);

  const isDimmed = (id: string) => {
    // If a photo is active, dim all other photos
    if (activePhotoId) {
      return id !== activePhotoId;
    }
    // If a color is active, dim photos not matching that color
    if (activeColor) {
      return !highlightedIds.has(id);
    }
    return false;
  };

  // Handle photo click to highlight this photo and its related colors
  const handlePhotoClick = (photo: PhotoData) => {
    // Toggle: if already showing this photo, clear it
    if (activePhotoId === photo.id) {
      setActivePhotoId(null);
      setActiveColor(null);
    } else {
      setActivePhotoId(photo.id);
      setActiveColor(null); // Clear color selection when photo is clicked
    }
  };

  // Get highlighted colors when a photo is active
  const highlightedColorIndices = useMemo(() => {
    if (!activePhotoId) return new Set<number>();

    const activePhoto = displayPhotos.find((p) => p && p.id === activePhotoId);
    if (
      !activePhoto ||
      !activePhoto.topColors ||
      !Array.isArray(activePhoto.topColors)
    ) {
      return new Set<number>();
    }

    const bestColor = getBestColor(activePhoto.topColors, paletteColors);
    const distances = paletteColors.map((color, idx) => ({
      idx,
      dist: colorDistance(bestColor, color),
    }));

    distances.sort((a, b) => a.dist - b.dist);

    const result = new Set<number>();

    // Add close matches (Delta E < 40)
    distances.forEach((d) => {
      if (d.dist < 40) {
        result.add(d.idx);
      }
    });

    // Fallback: if no close matches, take the closest one
    if (result.size === 0 && distances.length > 0) {
      result.add(distances[0].idx);
    }

    return result;
  }, [activePhotoId, displayPhotos, paletteColors]);

  // --- Detail View Logic ---

  const handleNextDetailPhoto = () => {
    setCurrentDetailIndex((prev) => (prev + 1) % detailPhotos.length);
  };

  const handlePrevDetailPhoto = () => {
    setCurrentDetailIndex(
      (prev) => (prev - 1 + detailPhotos.length) % detailPhotos.length
    );
  };

  // Identify highlight colors based on CURRENT filtered photo
  const highlightedPaletteIndices = useMemo(() => {
    if (detailPhotos.length === 0) return new Set();
    const currentPhoto = detailPhotos[currentDetailIndex];
    if (
      !currentPhoto ||
      !currentPhoto.topColors ||
      !Array.isArray(currentPhoto.topColors)
    ) {
      return new Set();
    }

    const bestColor = getBestColor(currentPhoto.topColors, paletteColors);
    const distances = paletteColors.map((color, i) => ({
      index: i,
      dist: colorDistance(bestColor, color),
    }));

    distances.sort((a, b) => a.dist - b.dist);

    // Always include the closest
    const result = new Set<number>();

    // Add close matches (Delta E < 40)
    // Since we filtered photos to ensure at least one match < 45, this will basically always yield results.
    distances.forEach((d) => {
      if (d.dist < 40) {
        result.add(d.index);
      }
    });

    // Fallback: if somehow nothing matches (due to filter edge case), take the absolute closest
    if (result.size === 0 && distances.length > 0) {
      result.add(distances[0].index);
    }

    return result;
  }, [currentDetailIndex, detailPhotos, paletteColors]);

  return (
    <div className="h-[100dvh] bg-gray-50 md:bg-white text-black pt-6 md:pt-0 px-6 md:px-0 pb-3 md:pb-0 flex flex-col items-center overflow-hidden relative">
      {/* Help Popup */}
      <AnimatePresence>
        {showHelpPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpPopup(false)}
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
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <HelpCircle size={20} className="text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold">사용 가이드</h3>
                  </div>

                  <div className="space-y-3 text-gray-700">
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <p className="flex-1">
                        <span className="font-semibold text-black">
                          팔레트 색상 클릭:
                        </span>{" "}
                        관련된 사진들이 강조됩니다
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <p className="flex-1">
                        <span className="font-semibold text-black">
                          사진 클릭:
                        </span>{" "}
                        해당 사진과 가장 관련된 팔레트 색상이 강조됩니다
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <p className="flex-1">
                        <span className="font-semibold text-black">
                          팔레트 이름 수정:
                        </span>{" "}
                        타이틀 옆 연필 아이콘을 클릭하거나 타이틀에 마우스를
                        올려보세요
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-bold">•</span>
                      <p className="flex-1">
                        <span className="font-semibold text-black">
                          자세히 보기:
                        </span>{" "}
                        모든 사진과 관련 색상을 하나씩 확인할 수 있습니다
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowHelpPopup(false)}
                    className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-colors font-medium mt-2"
                  >
                    확인
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Action Bar - Mobile: top bar, Desktop: left top corner */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-4 md:mb-0 md:absolute md:top-8 md:left-8 md:w-auto z-50 shrink-0">
        {/* Mobile layout: spread across */}
        <button
          onClick={onRetry}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 md:hidden"
        >
          <RefreshCw size={20} />
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg active:scale-95 text-sm md:hidden"
        >
          <Share2 size={16} />
          <span className="font-medium">Save</span>
        </button>

        {/* Desktop layout: grouped on left */}
        <div className="hidden md:flex gap-2">
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
          {!isDetailView ? (
            <button
              onClick={() => setIsDetailView(true)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full hover:bg-white transition-colors border border-gray-200/60 active:scale-95 text-sm"
            >
              <span className="font-medium">View Details</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDetailView(false)}
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full hover:bg-white transition-colors border border-gray-200/60 active:scale-95 text-sm"
            >
              <span className="font-medium">Back</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area (Capture Target) */}
      <div
        ref={captureRef}
        className="w-full max-w-[1000px] md:max-w-none h-[75%] md:h-full bg-white relative overflow-hidden flex flex-col justify-between shadow-2xl md:shadow-none border border-gray-100 md:border-none isolate shrink-0 md:shrink"
      >
        {isDetailView ? (
          // --- Detail View Content ---
          <div className="absolute inset-0 z-50 bg-white flex flex-col">
            {/* TOP: Palette Row */}
            <div className="w-full h-[140px] bg-white border-b border-gray-100 flex items-center justify-center gap-2 md:gap-4 px-4 shrink-0 z-20">
              {paletteColors.map((color, idx) => {
                const isActive = highlightedPaletteIndices.has(idx);
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      opacity: isActive ? 1 : 0.2, // Stronger dimming for inactive
                      scale: isActive ? 1.05 : 0.95,
                      y: isActive ? 0 : 5,
                    }}
                    className="flex flex-col items-center"
                  >
                    <div
                      className="w-12 h-16 md:w-16 md:h-20 shadow-sm" // Vertical rectangular chips
                      style={{ backgroundColor: color.hex }}
                    />
                    <span
                      className={`text-[10px] uppercase tracking-widest mt-2 font-mono ${
                        isActive ? "text-black font-bold" : "text-gray-300"
                      }`}
                    >
                      {color.hex}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* BOTTOM: Main Photo Area */}
            <div className="flex-1 relative bg-gray-50 flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
              <div className="flex-1 w-full flex items-center justify-center relative px-12">
                <AnimatePresence mode="wait">
                  {detailPhotos[currentDetailIndex] &&
                    (() => {
                      const currentPhoto = detailPhotos[currentDetailIndex];
                      if (!currentPhoto || !currentPhoto.id) return null;
                      const aspectRatio = imageAspectRatios[currentPhoto.id];
                      const isSquare =
                        aspectRatio && aspectRatio >= 0.9 && aspectRatio <= 1.1;
                      const isLandscape = aspectRatio && aspectRatio > 1.1;

                      // Increased sizes for better visibility
                      let maxSize = isSquare || isLandscape ? "98%" : "92%";

                      // Use filtered image if available, otherwise original
                      const displayUrl =
                        filteredPhotoUrls[currentPhoto.id] || currentPhoto.url;

                      return (
                        <motion.div
                          key={currentPhoto.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center justify-center relative z-10"
                          style={{ maxWidth: "100%", maxHeight: "100%" }}
                        >
                          <img
                            src={displayUrl}
                            alt="Detail"
                            className="object-contain shadow-xl"
                            style={{
                              maxWidth: maxSize,
                              maxHeight: maxSize,
                            }}
                          />
                        </motion.div>
                      );
                    })()}
                </AnimatePresence>

                {/* Modern Navigation Buttons - Minimal arrows */}
                <button
                  onClick={handlePrevDetailPhoto}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/5 rounded-md text-black/60 hover:text-black transition-all z-20"
                >
                  <ChevronLeft size={20} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleNextDetailPhoto}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/5 rounded-md text-black/60 hover:text-black transition-all z-20"
                >
                  <ChevronRight size={20} strokeWidth={1.5} />
                </button>
              </div>

              {/* Bottom Navigation Dots - Horizontal */}
              <div className="w-full flex justify-center mt-4 z-20 px-2">
                <div className="flex gap-2 max-w-full overflow-x-auto scrollbar-hide">
                  {detailPhotos.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentDetailIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer shrink-0 ${
                        idx === currentDetailIndex
                          ? "bg-black scale-150 ring-2 ring-gray-200"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // --- Instagram 3x3 Grid View ---
          <>
            {/* 3x3 Grid Container - Mobile: top, Desktop: right side top */}
            <div className="absolute inset-0 z-0 flex items-start justify-center md:justify-end pt-4 md:pt-8 p-4 md:p-8 md:pr-16">
              <div className="w-full max-w-[600px] md:max-w-[650px] aspect-square grid grid-cols-3 gap-1 md:gap-2">
                {displayPhotos.length === 0 ? (
                  <div className="col-span-3 flex items-center justify-center text-gray-400">
                    사진을 불러오는 중...
                  </div>
                ) : (
                  displayPhotos.map((photo, index) => {
                    const dimmed = isDimmed(photo.id);
                    const displayUrl = filteredPhotoUrls[photo.id] || photo.url;

                    return (
                      <motion.div
                        key={photo.id}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: dimmed ? 0.15 : 1,
                        }}
                        transition={{
                          duration: 0.3,
                          opacity: { duration: 0 }, // Instant opacity change when dimming
                        }}
                        onClick={() => handlePhotoClick(photo)}
                        className="relative w-full h-full bg-gray-100 overflow-hidden cursor-pointer"
                      >
                        <img
                          src={displayUrl}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to original URL if filtered URL fails
                            if (displayUrl !== photo.url) {
                              console.warn(
                                "Filtered image failed, using original for",
                                photo.id
                              );
                              e.currentTarget.src = photo.url;
                            } else {
                              console.error(
                                "Image load failed for",
                                photo.id,
                                photo.url
                              );
                            }
                          }}
                          onLoad={() => {
                            // Image loaded successfully
                          }}
                        />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Palette & Info Section - Mobile: bottom-left, Desktop: left side aligned with buttons */}
            <div className="z-30 absolute bottom-4 left-4 md:left-8 md:top-[70%] md:-translate-y-1/2 md:bottom-auto flex flex-col items-start justify-end bg-transparent pointer-events-none select-none md:h-[min(44vw,44vh)]">
              {/* Title */}
              <div className="mb-4 text-left pointer-events-auto flex items-center gap-2 group">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={() => setIsEditingTitle(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsEditingTitle(false);
                      }
                    }}
                    autoFocus
                    className="text-2xl md:text-4xl font-light text-black tracking-tight leading-tight bg-transparent border-b-2 border-black focus:outline-none"
                  />
                ) : (
                  <>
                    <h2 className="text-2xl md:text-4xl font-light text-black tracking-tight leading-tight">
                      {editedTitle}
                    </h2>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className={`p-1.5 hover:bg-gray-100 rounded-full transition-all duration-500 ${
                        showEditIconHint
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <Edit2 size={18} className="text-gray-600" />
                    </button>
                  </>
                )}
              </div>

              {/* Color Swatches */}
              <div className="flex gap-3 pointer-events-auto">
                {paletteColors.map((color, idx) => {
                  // If photo is active, highlight related colors
                  // If color is active, highlight that color
                  // Otherwise, show all colors normally
                  let isActive = true;
                  if (activePhotoId) {
                    isActive = highlightedColorIndices.has(idx);
                  } else if (activeColor) {
                    isActive = activeColor === color;
                  }

                  return (
                    <button
                      key={idx}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 border-white focus:outline-none ring-1 ring-black/5"
                      style={{
                        backgroundColor: color.hex,
                        opacity: isActive ? 1 : 0.2,
                      }}
                      onMouseEnter={() => {
                        if (!activePhotoId) setActiveColor(color);
                      }}
                      onMouseLeave={() => {
                        if (!activePhotoId) setActiveColor(null);
                      }}
                      onClick={() => {
                        setActivePhotoId(null); // Clear photo selection
                        setActiveColor(activeColor === color ? null : color);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* View Toggle Button - Mobile: centered bottom, Desktop: left top with other buttons */}
      <div className="flex-1 md:hidden flex items-center justify-center z-50">
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

      {/* Help Button - Bottom Left */}
      <button
        onClick={() => setShowHelpPopup(true)}
        className="absolute bottom-6 left-6 p-3 bg-black/10 hover:bg-black/20 rounded-full transition-all hover:scale-110 z-50 border border-black/10"
        aria-label="도움말"
      >
        <HelpCircle size={24} className="text-black" strokeWidth={2} />
      </button>
    </div>
  );
};
