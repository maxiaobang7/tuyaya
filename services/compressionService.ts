import { CompressionSettings } from '../types';

declare global {
  interface Window {
    UPNG: any;
  }
}

/**
 * Compresses an image file using the HTML5 Canvas API.
 * Uses UPNG.js for better PNG compression if available.
 */
export const compressImage = async (
  file: File,
  settings: CompressionSettings
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > settings.maxWidth) {
          height = Math.round((height * settings.maxWidth) / width);
          width = settings.maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw image to canvas
        // For JPEG/WebP (flattening transparency), fill white background
        if (settings.outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        } else {
           // For PNG/WebP, clear canvas first
           ctx.clearRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output type
        const outputType = settings.outputFormat === 'original' ? file.type : settings.outputFormat;
        
        // Special Handling for PNG to ensure size reduction via UPNG.js (Quantization)
        if (outputType === 'image/png' && typeof window.UPNG !== 'undefined') {
          try {
            const imgData = ctx.getImageData(0, 0, width, height);
            const rgba = imgData.data.buffer;
            
            // Map quality (0.1 - 1.0) to number of colors (cnum)
            // 1.0 -> 0 (Lossless, 32-bit)
            // 0.8 -> 256 colors
            // 0.6 -> 128 colors
            // 0.4 -> 64 colors
            // 0.2 -> 32 colors
            let cnum = 0;
            const q = settings.quality;
            
            if (q > 0.9) cnum = 0;
            else if (q > 0.7) cnum = 256;
            else if (q > 0.5) cnum = 128;
            else if (q > 0.3) cnum = 64;
            else cnum = 32;

            // UPNG.encode([buffer], w, h, cnum, dregs)
            // Note: UPNG.encode is synchronous and cpu intensive, may block main thread briefly for large images.
            const pngParams = window.UPNG.encode([rgba], width, height, cnum);
            const blob = new Blob([pngParams], { type: 'image/png' });
            resolve(blob);
            return;
          } catch (e) {
            console.warn("UPNG optimization failed, falling back to standard canvas", e);
            // Fallthrough to standard canvas.toBlob
          }
        }

        // Standard Canvas Compression (JPEG, WebP, or fallback PNG)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Compression resulted in null blob'));
            }
          },
          outputType,
          settings.quality
        );
      };
      
      img.onerror = (err) => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = (err) => reject(new Error('Failed to read file'));
  });
};