import React, { useState, useEffect } from "react";

export const LoadingPage: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress from 0% to 100% over 4.5 seconds (matching App.tsx delay)
    const duration = 4500; // 4.5 seconds
    const intervalTime = 50; // Update every 50ms
    const increment = (100 / duration) * intervalTime;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative">
      {/* Background Ambience (matching IntroPage/ResultPage) */}
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

      {/* Center Content */}
      <div className="relative z-10 text-center px-4">
        <div className="font-mono text-[#1A1A1A] mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
            Processing
          </p>
          <h1 className="text-2xl md:text-3xl uppercase tracking-tight">
            Analyzing Your Colors
          </h1>
        </div>

        {/* Progress Bar - Receipt Style */}
        <div className="w-[280px] md:w-[320px] mx-auto">
          <div className="h-1 bg-gray-300 overflow-hidden">
            <div
              className="h-full bg-[#1A1A1A] transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
              Please Wait...
            </p>
            <p className="text-[10px] text-gray-400 font-mono">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 left-0 w-full text-center z-10 opacity-30">
        <p className="text-[10px] uppercase font-mono tracking-widest text-gray-500">
          Photo Recap 2025 / Color Analysis
        </p>
      </footer>
    </div>
  );
};
