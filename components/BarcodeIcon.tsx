import React from "react";

interface BarcodeIconProps {
  className?: string;
  height?: number;
}

const BarcodeIcon: React.FC<BarcodeIconProps> = ({
  className = "",
  height = 30,
}) => {
  // viewBox aspect ratio: 180:100 = 1.8:1
  // const height = width
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 180 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={className}
    >
      <path d="M4 0H0V100H4V0Z" fill="#1a1a1a" />
      <path d="M8 0H6V100H8V0Z" fill="#1a1a1a" />
      <path d="M14 0H12V90H14V0Z" fill="#1a1a1a" />
      <path d="M24 0H22V90H24V0Z" fill="#1a1a1a" />
      <path d="M19 0H17V90H19V0Z" fill="#1a1a1a" />
      <path d="M34 0H26V90H34V0Z" fill="#1a1a1a" />
      <path d="M40 0H38V90H40V0Z" fill="#1a1a1a" />
      <path d="M46 0H42V90H46V0Z" fill="#1a1a1a" />
      <path d="M58 0H50V90H58V0Z" fill="#1a1a1a" />
      <path d="M62 0H60V90H62V0Z" fill="#1a1a1a" />
      <path d="M68 0H64V90H68V0Z" fill="#1a1a1a" />
      <path d="M74 0H72V90H74V0Z" fill="#1a1a1a" />
      <path d="M80 0H76V90H80V0Z" fill="#1a1a1a" />
      <path d="M92 0H88V90H92V0Z" fill="#1a1a1a" />
      <path d="M96 0H94V90H96V0Z" fill="#1a1a1a" />
      <path d="M108 0H100V90H108V0Z" fill="#1a1a1a" />
      <path d="M112 0H110V90H112V0Z" fill="#1a1a1a" />
      <path d="M124 0H116V90H124V0Z" fill="#1a1a1a" />
      <path d="M128 0H126V90H128V0Z" fill="#1a1a1a" />
      <path d="M140 0H132V90H140V0Z" fill="#1a1a1a" />
      <path d="M148 0H146V90H148V0Z" fill="#1a1a1a" />
      <path d="M145 0H143V90H145V0Z" fill="#1a1a1a" />
      <path d="M130 0H128V90H130V0Z" fill="#1a1a1a" />
      <path d="M83 0H81V90H83V0Z" fill="#1a1a1a" />
      <path d="M87 0H85V90H87V0Z" fill="#1a1a1a" />
      <path d="M49 0H47V90H49V0Z" fill="#1a1a1a" />
      <path d="M37 0H35V90H37V0Z" fill="#1a1a1a" />
      <path d="M152 0H150V90H152V0Z" fill="#1a1a1a" />
      <path d="M158 0H154V90H158V0Z" fill="#1a1a1a" />
      <path d="M170 0H164V90H170V0Z" fill="#1a1a1a" />
      <path d="M174 0H172V100H174V0Z" fill="#1a1a1a" />
      <path d="M180 0H176V100H180V0Z" fill="#1a1a1a" />
    </svg>
  );
};

export default BarcodeIcon;
