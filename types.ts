export interface CompressionSettings {
  quality: number; // 0.1 to 1.0
  maxWidth: number;
  outputFormat: 'original' | 'image/jpeg' | 'image/png' | 'image/webp';
}

export type ProcessingStatus = 'pending' | 'processing' | 'done' | 'error';

export interface ImageFile {
  id: string;
  originalFile: File;
  compressedBlob: Blob | null;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  status: ProcessingStatus;
  reduction: number;
  error?: string;
}

export interface DragState {
  isDragging: boolean;
}

export type Language = 'zh' | 'en';

export type AppMode = 'compress' | 'crop' | 'gif-crop';