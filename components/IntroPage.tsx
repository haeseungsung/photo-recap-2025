import React, { useEffect, useState } from "react";
import HalftoneGraphic from "./HalftoneGraphic";
import BarcodeIcon from "./BarcodeIcon";
import { Footer } from "./Footer";

interface IntroPageProps {
  onStart: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onStart }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Start printing animation after a tiny delay
    const printTimer = setTimeout(() => {
      setIsPrinting(true);
    }, 100);

    // Show button after animation completes
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 1100); // 2500ms animation + 100ms delay

    return () => {
      clearTimeout(printTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start pt-12 md:pt-20 bg-gray-50 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Soft shadow vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-100 to-gray-200 opacity-80"></div>
        {/* Subtle noise for wall texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      <div
        className=" absolute top-6 md:top-[3.3rem] left-1/2 -translate-x-1/2
    h-12 max-w-[380px] w-full
    bg-gray-300 z-10
    rounded-lg
  "
        style={{
          boxShadow: `
      inset 0 2px 3px rgba(255,255,255,0.6),
      inset 0 -2px 4px rgba(0,0,0,0.15),
      0 6px 12px rgba(0,0,0,0.25)
    `,
        }}
      />
      {/* Main Content Area */}
      <main className="relative z-10 w-full px-4 pb-20">
        {/* Receipt Wrapper */}
        <div
          className="pointer-events-none absolute top-[-5px] h-[10px] z-19
         max-w-[370px] w-full px-[12px] left-1/2 -translate-x-1/2 overflow-hidden"
        >
          <div
            className="w-full h-full rounded-lg"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.55), rgba(0,0,0,0))",
            }}
          />
        </div>

        <div className="relative w-full max-w-[360px] mx-auto overflow-hidden pb-4 pt-0">
          <div className="relative w-full max-w-[340px] mx-auto perspective-1000">
            {/* 2️⃣ PAPER OCCLUSION SHADOW (종이에 떨어지는 그림자) */}
            <div className="pointer-events-none absolute top-[-5px] left-0 right-0 h-6 z-20  w-full left-1/2 -translate-x-1/2">
              <div
                className="w-full h-full   "
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.18), rgba(0,0,0,0))",
                }}
              />
            </div>
            {/* Animation Container */}
            <div
              className={`relative transform transition-transform duration-[1000ms] will-change-transform ${
                isPrinting ? "translate-y-0" : "-translate-y-full z-20"
              }`}
            >
              {/* The Receipt Paper */}
              <div className="relative bg-[#FCFAF7] text-[#1A1A1A] font-mono px-6 pt-12 pb-16 shadow-lg">
                {/* Subtle Folds/Wrinkles */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-5 z-10"
                  style={{
                    background:
                      "linear-gradient(175deg, transparent 40%, #000 40%, transparent 43%), linear-gradient(5deg, transparent 60%, #000 60%, transparent 62%)",
                  }}
                ></div>

                {/* Header */}
                <div className="text-center mb-8">
                  <h1 className="text-[28px] font-bold tracking-[0.2rem] font-jersey uppercase mb-2 ">
                    Photo Receipt
                  </h1>
                  {/* <p className="text-xs text-gray-500 uppercase tracking-widest">
                    Color Palette Generator
                  </p> */}
                  <p className="text-xs text-gray-500 mt-2">
                    {`${new Date().toLocaleString("sv-SE").replace("T", " ")}`}
                  </p>
                </div>

                {/* Halftone Graphic Area */}
                <div className="mb-6 relative" onClick={onStart}>
                  <HalftoneGraphic />
                  {/* {/* Start Button Overlay */}
                  {/* {showButton && (
                    <button
                      onClick={onStart}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                 bg-white/90 backdrop-blur-sm hover:bg-white
                                 text-[#1A1A1A] font-bold uppercase tracking-widest
                                 px-8 py-3 rounded-full shadow-lg
                                 transition-all duration-300 hover:scale-110 hover:shadow-xl
                                 border-2 border-[#1A1A1A]
                                 text-sm z-20"
                    >
                      Start
                    </button>
                  )} */}
                </div>

                {/* Divider */}
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-4"></div>

                {/* Description */}
                <div className="text-center mb-4">
                  <p className="text-xs leading-relaxed uppercase opacity-80 max-w-[240px] mx-auto">
                    Upload your photos <br /> and get your receipt
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full border-b border-dashed border-[#1A1A1A]/30 mb-6"></div>

                {/* Features List */}
                {/* <div className="flex flex-col gap-3 mb-8 text-sm">
                  <div className="flex justify-between text-xs text-gray-500 uppercase mb-1">
                    <span>Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">→</span>
                    <span className="text-xs uppercase">
                      Color Palette Generator
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">→</span>
                    <span className="text-xs uppercase">
                      Halftone Processing
                    </span>
                  </div>
                </div> */}

                {/* Barcode Button */}

                <button
                  onClick={onStart}
                  disabled={!showButton}
                  className={`w-full relative text-center space-y-2 transition-all duration-300 ${
                    showButton
                      ? "opacity-100 cursor-pointer hover:scale-105"
                      : "opacity-90 cursor-default"
                  }`}
                >
                  <div className="w-3/4 mx-auto flex justify-center relative">
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        uppercase tracking-[0.1rem] font-jersey z-20 text-[48px] text-white
                    ${showButton ? "opacity-100" : "opacity-0"}
                    transition-opacity duration-300
                    `}
                    >
                      Start
                    </div>
                    <BarcodeIcon height={60} />
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.2rem]">
                    Thank you
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

      <Footer />
    </div>
  );
};
