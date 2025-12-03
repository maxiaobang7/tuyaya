import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { translations } from '../utils';
import Dropzone from './Dropzone';
import { Download, RotateCcw, Monitor, Square, RectangleHorizontal, RectangleVertical, Loader2 } from 'lucide-react';
// @ts-ignore
import { parseGIF, decompressFrames } from 'gifuct-js';

// Declare global types for external libraries loaded via CDN
declare global {
  interface Window {
    GIF: any;
  }
}

interface GifCropperProps {
  lang: Language;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GifCropper: React.FC<GifCropperProps> = ({ lang }) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | null>(null); // null = free
  const [isProcessing, setIsProcessing] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef<string | null>(null); // 'move', 'nw', 'ne', 'sw', 'se'
  const dragStartRef = useRef<{ x: number; y: number; crop: CropRect }>({ x: 0, y: 0, crop: { x: 0, y: 0, width: 0, height: 0 } });

  const t = translations[lang];

  const handleFileAdded = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset crop on new image
      setCrop({ x: 0, y: 0, width: 0, height: 0 });
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgDimensions({ width, height });
    
    // Default crop: 80% centered
    const w = width * 0.8;
    const h = height * 0.8;
    const x = (width - w) / 2;
    const y = (height - h) / 2;
    setCrop({ x, y, width: w, height: h });
  };

  // --- Interaction Logic (Same as Cropper) ---

  const getMousePos = (e: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = type;
    const pos = getMousePos(e);
    dragStartRef.current = { x: pos.x, y: pos.y, crop: { ...crop } };
  };

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    e.preventDefault();

    const pos = getMousePos(e);
    const dx = pos.x - dragStartRef.current.x;
    const dy = pos.y - dragStartRef.current.y;
    const startCrop = dragStartRef.current.crop;
    const containerW = containerRef.current.offsetWidth;
    const containerH = containerRef.current.offsetHeight;

    let newCrop = { ...startCrop };

    if (isDraggingRef.current === 'move') {
      newCrop.x = Math.min(Math.max(0, startCrop.x + dx), containerW - startCrop.width);
      newCrop.y = Math.min(Math.max(0, startCrop.y + dy), containerH - startCrop.height);
    } else {
      // Resizing logic
      if (isDraggingRef.current.includes('e')) newCrop.width = Math.min(Math.max(20, startCrop.width + dx), containerW - startCrop.x);
      if (isDraggingRef.current.includes('s')) newCrop.height = Math.min(Math.max(20, startCrop.height + dy), containerH - startCrop.y);
      if (isDraggingRef.current.includes('w')) {
        const maxDelta = startCrop.width - 20;
        const delta = Math.min(Math.max(-startCrop.x, dx), maxDelta);
        newCrop.x = startCrop.x + delta;
        newCrop.width = startCrop.width - delta;
      }
      if (isDraggingRef.current.includes('n')) {
        const maxDelta = startCrop.height - 20;
        const delta = Math.min(Math.max(-startCrop.y, dy), maxDelta);
        newCrop.y = startCrop.y + delta;
        newCrop.height = startCrop.height - delta;
      }

      // Aspect Ratio constraint
      if (aspectRatio) {
        if (isDraggingRef.current === 'se' || isDraggingRef.current === 'nw') {
           newCrop.height = newCrop.width / aspectRatio;
        } else if (isDraggingRef.current === 'sw' || isDraggingRef.current === 'ne') {
           newCrop.height = newCrop.width / aspectRatio;
        }
        // Basic check to keep within bounds
        if (newCrop.height + newCrop.y > containerH) {
           newCrop.height = containerH - newCrop.y;
           newCrop.width = newCrop.height * aspectRatio;
        }
      }
    }

    setCrop(newCrop);
  }, [crop, aspectRatio]);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const setRatio = (ratio: number | null) => {
    setAspectRatio(ratio);
    if (ratio && imgDimensions.width > 0) {
      const w = crop.width;
      const h = w / ratio;
      const y = crop.y + (crop.height - h) / 2;
      let newH = h;
      let newW = w;
      if (newH > imgDimensions.height) {
         newH = imgDimensions.height;
         newW = newH * ratio;
      }
      setCrop(prev => ({ ...prev, width: newW, height: newH, y: Math.max(0, y) }));
    }
  };

  const handleDownload = async () => {
    if (!image || !imgRef.current || isProcessing) return;
    
    // Check if external libraries are loaded
    if (!window.GIF) {
      alert("GIF Encoder library not loaded. Please refresh the page.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Get ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();

      // 2. Parse GIF (using imported functions)
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true); // true = buildImagePatches

      // 3. Prepare GIF Encoder
      // Fetch worker script code
      let workerUrl;
      try {
        const workerBlob = await fetch('https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js')
            .then(r => {
                if (!r.ok) throw new Error("Network error fetching worker");
                return r.blob();
            });
        workerUrl = URL.createObjectURL(workerBlob);
      } catch (e) {
        console.error("Failed to load GIF worker from CDN", e);
        alert("Failed to initialize GIF processor. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      // Determine the real scale between display and natural size
      const naturalWidth = imgRef.current.naturalWidth;
      const displayWidth = imgDimensions.width;
      
      const scale = naturalWidth / displayWidth;
      
      const finalCropX = crop.x * scale;
      const finalCropY = crop.y * scale;
      const finalCropW = crop.width * scale;
      const finalCropH = crop.height * scale;

      const gifEncoder = new window.GIF({
          workers: 2,
          quality: 10,
          width: finalCropW,
          height: finalCropH,
          workerScript: workerUrl
      });

      // 4. Canvas setup for reconstruction
      const canvas = document.createElement('canvas');
      canvas.width = naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas context failed");

      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = finalCropW;
      cropCanvas.height = finalCropH;
      const cropCtx = cropCanvas.getContext('2d');

      // 5. Process frames
      frames.forEach((frame: any) => {
          const { dims, patch, delay, disposalType } = frame;

          // Draw the patch to a temp canvas
          if (tempCanvas.width !== dims.width || tempCanvas.height !== dims.height) {
              tempCanvas.width = dims.width;
              tempCanvas.height = dims.height;
          }
          const patchData = new ImageData(patch, dims.width, dims.height);
          tempCtx?.putImageData(patchData, 0, 0);

          // Draw temp canvas to main reconstruction canvas
          ctx.drawImage(tempCanvas, dims.left, dims.top);

          // Crop
          cropCtx?.drawImage(
            canvas, 
            finalCropX, finalCropY, finalCropW, finalCropH, 
            0, 0, finalCropW, finalCropH
          );

          // Add to encoder
          gifEncoder.addFrame(cropCtx, { delay: delay, copy: true });

          // Handle Disposal (Basic support)
          // 2 = Restore to background color
          if (disposalType === 2) {
              ctx.clearRect(dims.left, dims.top, dims.width, dims.height);
          }
          // 3 = Restore to previous (not implemented for simplicity)
      });

      // 6. Render
      gifEncoder.on('finished', (blob: Blob) => {
        setIsProcessing(false);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const originalName = image.name.substring(0, image.name.lastIndexOf('.'));
        link.download = `${originalName}-cropped.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(workerUrl);
      });

      gifEncoder.render();

    } catch (error) {
      console.error("GIF Processing Error:", error);
      setIsProcessing(false);
      alert(t.error + ": " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const cancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
    setIsProcessing(false);
  };

  return (
    <div>
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          {t.gifTitle}
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {t.gifSubtitle}
        </p>
      </div>

      {!image ? (
        <Dropzone onFilesAdded={handleFileAdded} lang={lang} accept="image/gif" />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 mr-2">{t.cropRatio}:</span>
              
              <button 
                onClick={() => setRatio(null)}
                className={`px-3 py-1.5 text-sm rounded-md border flex items-center gap-1.5 transition-colors ${!aspectRatio ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                <Monitor size={14} /> {t.ratioFree}
              </button>
              <button 
                onClick={() => setRatio(1)}
                className={`px-3 py-1.5 text-sm rounded-md border flex items-center gap-1.5 transition-colors ${aspectRatio === 1 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                <Square size={14} /> {t.ratio11}
              </button>
              <button 
                onClick={() => setRatio(16/9)}
                className={`px-3 py-1.5 text-sm rounded-md border flex items-center gap-1.5 transition-colors ${aspectRatio === 16/9 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                <RectangleHorizontal size={14} /> {t.ratio169}
              </button>
               <button 
                onClick={() => setRatio(4/3)}
                className={`px-3 py-1.5 text-sm rounded-md border flex items-center gap-1.5 transition-colors ${aspectRatio === 4/3 ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'}`}
              >
                <RectangleVertical size={14} /> {t.ratio43}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={cancel}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw size={16} />
                {t.cancel}
              </button>
              <button
                onClick={handleDownload}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isProcessing ? t.processing : t.applyCrop}
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="p-6 bg-slate-100 flex justify-center overflow-hidden relative select-none">
            <div 
              ref={containerRef}
              className="relative inline-block shadow-lg"
              style={{ maxHeight: '70vh', touchAction: 'none' }}
            >
              <img
                ref={imgRef}
                src={previewUrl || ''}
                alt="Crop Target"
                onLoad={onImageLoad}
                className="max-h-[70vh] w-auto block pointer-events-none"
                draggable={false}
              />
              
              <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>

              {/* Crop Box */}
              <div
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                  backgroundImage: `url(${previewUrl})`,
                  backgroundPosition: `-${crop.x}px -${crop.y}px`,
                  backgroundSize: `${imgDimensions.width}px ${imgDimensions.height}px`,
                  backgroundRepeat: 'no-repeat'
                }}
                className={`absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] box-content ${isProcessing ? 'cursor-wait' : 'cursor-move'}`}
                onMouseDown={(e) => !isProcessing && handleMouseDown(e, 'move')}
                onTouchStart={(e) => !isProcessing && handleMouseDown(e, 'move')}
              >
                <div className="absolute inset-0 grid grid-cols-3 pointer-events-none opacity-50">
                  <div className="border-r border-white/50"></div>
                  <div className="border-r border-white/50"></div>
                </div>
                <div className="absolute inset-0 grid grid-rows-3 pointer-events-none opacity-50">
                   <div className="border-b border-white/50"></div>
                   <div className="border-b border-white/50"></div>
                </div>

                {!isProcessing && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-primary-500 cursor-nw-resize z-10" onMouseDown={(e) => handleMouseDown(e, 'nw')} onTouchStart={(e) => handleMouseDown(e, 'nw')} />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-primary-500 cursor-ne-resize z-10" onMouseDown={(e) => handleMouseDown(e, 'ne')} onTouchStart={(e) => handleMouseDown(e, 'ne')} />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-primary-500 cursor-sw-resize z-10" onMouseDown={(e) => handleMouseDown(e, 'sw')} onTouchStart={(e) => handleMouseDown(e, 'sw')} />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-primary-500 cursor-se-resize z-10" onMouseDown={(e) => handleMouseDown(e, 'se')} onTouchStart={(e) => handleMouseDown(e, 'se')} />
                  </>
                )}
              </div>
            </div>
          </div>
          
           <div className="p-3 text-center text-xs text-slate-400 bg-white border-t border-slate-100">
             {t.cropDrag}
           </div>
        </div>
      )}
    </div>
  );
};

export default GifCropper;