import React from "react";

interface HalftoneGraphicProps {
  className?: string;
}

const HalftoneGraphic: React.FC<HalftoneGraphicProps> = ({
  className = "",
}) => {
  const patternId = "halftone-dots";

  return (
    <div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="4" cy="4" r="2.5" fill="#1a1a1a" />
          </pattern>
        </defs>

        {/* Border box */}
        <rect
          x="5"
          y="5"
          width="190"
          height="190"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
        />

        {/* 2025 text with halftone pattern */}
        <g fill={`url(#${patternId})`}>
          <text
            x="50%"
            y="55%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="80"
            fontWeight="bold"
            fontFamily="monospace"
            fill="black"
          >
            2025
          </text>
        </g>
      </svg>
    </div>
  );
};

export default HalftoneGraphic;
