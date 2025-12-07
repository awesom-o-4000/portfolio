
export enum AppStep {
  UPLOAD = 'UPLOAD',
  PREVIEW = 'PREVIEW',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  GALLERY = 'GALLERY'
}

export interface StickerVariation {
  emotion: string;
  image: string; // Base64
}

export interface StickerPack {
  id: string;
  sourceImage: string;
  stickers: StickerVariation[]; // Index 0 is usually the main generated sticker
  timestamp: number;
}

export type ImageAspect = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';
