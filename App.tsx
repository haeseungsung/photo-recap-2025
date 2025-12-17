import React, { useState } from "react";
import { AppState, PhotoData, PaletteResult } from "./types";
import { IntroPage } from "./components/IntroPage";
import { UploadPage } from "./components/UploadPage";
import { LoadingPage } from "./components/LoadingPage";
import { ResultPage } from "./components/ResultPage";
import { generatePaletteFromColors, getTopColors } from "./utils/colorUtils";
import { analyzePaletteWithGemini } from "./services/geminiService";

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [result, setResult] = useState<PaletteResult | null>(null);

  const startAnalysis = async (uploadedPhotos: PhotoData[]) => {
    setPhotos(uploadedPhotos);
    setAppState(AppState.LOADING);

    try {
      // 1. Extract 5 colors from each photo
      const colorPromises = uploadedPhotos.map((photo) =>
        getTopColors(photo.url, 5).then(({ colors, scoredColors }) => ({
          colors,
          scoredColors,
        }))
      );
      const colorArrays = await Promise.all(colorPromises);
      const allColors = colorArrays.flatMap(({ colors }) => colors);
      const allScoredColors = colorArrays.flatMap(
        ({ scoredColors }) => scoredColors
      );

      // 2. Generate Palette (clustering)
      const paletteColors = generatePaletteFromColors(
        allColors,
        allScoredColors,
        5
      );

      // 3. Get Creative Title from Gemini
      // Artificial delay to ensure the loading animation completes (matches progress bar duration)
      const [aiResult] = await Promise.all([
        analyzePaletteWithGemini(paletteColors),
        // Wait 4.5 seconds to match progress bar animation
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      setResult({
        title: aiResult.title,
        hashtags: aiResult.hashtags,
        colors: paletteColors,
      });

      setAppState(AppState.RESULT);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert(
        "분석 중 오류가 발생했습니다. 다시 시도해주세요.\n\n오류: " +
          (error instanceof Error ? error.message : String(error))
      );
      // Return to upload page instead of intro, so user doesn't lose their photos
      setAppState(AppState.UPLOAD);
    }
  };

  const resetApp = () => {
    setPhotos([]);
    setResult(null);
    setAppState(AppState.INTRO);
  };

  return (
    <main>
      {appState === AppState.INTRO && (
        <IntroPage onStart={() => setAppState(AppState.UPLOAD)} />
      )}
      {appState === AppState.UPLOAD && <UploadPage onAnalyze={startAnalysis} />}
      {appState === AppState.LOADING && <LoadingPage />}
      {appState === AppState.RESULT && result && (
        <ResultPage photos={photos} palette={result} onRetry={resetApp} />
      )}
    </main>
  );
};

export default App;
