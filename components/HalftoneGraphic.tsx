import React, { useEffect, useState } from "react";
import { applyPaletteFilter } from "../utils/colorUtils";

interface HalftoneGraphicProps {
  className?: string;
}

const HalftoneGraphic: React.FC<HalftoneGraphicProps> = ({
  className = "",
}) => {
  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");

  useEffect(() => {
    // Process cherry.jpg with halftone filter
    const cherryImagePath = "/cherry.jpg";

    // Use grayscale palette (black only) for pure halftone effect
    const grayscalePalette = [{ r: 0, g: 0, b: 0, hex: "#000000" }];

    applyPaletteFilter(cherryImagePath, grayscalePalette, 15, 0.0, 15)
      .then((result) => {
        setProcessedImageUrl(result.url);
      })
      .catch((err) => {
        console.error("Failed to process cherry image:", err);
      });
  }, []);

  return (
    <div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
    >
      <div className="relative w-full h-full ">
        {processedImageUrl ? (
          <img
            src={processedImageUrl}
            alt="Cherry halftone"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-500">Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalftoneGraphic;
