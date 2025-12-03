import { CompressionSettings } from '../types';

/**
 * Compresses an image file using the HTML5 Canvas API.
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
        ctx.fillStyle = '#FFFFFF'; // Ensure transparent PNGs converted to JPEG have white background if needed
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output type
        const outputType = settings.outputFormat === 'original' ? file.type : settings.outputFormat;
        
        // Quality mapping: 0.1 to 1.0
        // Canvas toBlob uses 0.0 to 1.0 quality for jpeg/webp
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