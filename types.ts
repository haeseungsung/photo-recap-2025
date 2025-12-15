export interface ColorData {
  r: number;
  g: number;
  b: number;
  hex: string;
  photoIds?: string[]; // Track which photos contributed to this color
}

export interface PhotoData {
  id: string;
  url: string;
  file: File;
  topColors: ColorData[];
}

export interface PaletteResult {
  title: string;
  hashtags: string[];
  colors: ColorData[];
}

export enum AppState {
  INTRO = "INTRO",
  UPLOAD = "UPLOAD",
  LOADING = "LOADING",
  RESULT = "RESULT",
}
