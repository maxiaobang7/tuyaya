import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import Dropzone from './Dropzone';
import ControlPanel from './ControlPanel';
import ImageItem from './ImageItem';
import { compressImage } from '../services/compressionService';
import { ImageFile, CompressionSettings, Language } from '../types';
import { generateId, getReductionPercentage, formatBytes, translations } from '../utils';
import { DownloadCloud } from 'lucide-react';

interface CompressorProps {
  lang: Language;
}

const Compressor: React.FC<CompressorProps> = ({ lang }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 0.8,
    maxWidth: 1920,
    outputFormat: 'original',
  });

  const t = translations[lang];

  // Core compression logic
  const processImage = useCallback(async (img: ImageFile, currentSettings: CompressionSettings) => {
    try {
      const compressedBlob = await compressImage(img.originalFile, currentSettings);
      
      setImages(prev => prev.map(p => {
        if (p.id !== img.id) return p;
        
        return {
          ...p,
          status: 'done',
          compressedBlob,
          compressedSize: compressedBlob.size,
          reduction: getReductionPercentage(p.originalSize, compressedBlob.size)
        };
      }));
    } catch (error) {
      console.error("Compression failed", error);
      setImages(prev => prev.map(p => {
        if (p.id !== img.id) return p;
        return { ...p, status: 'error', error: 'Compression failed' };
      }));
    }
  }, []);

  // Trigger compression when images are added or settings change
  useEffect(() => {
    const pendingImages = images.filter(img => img.status === 'pending');
    
    if (pendingImages.length > 0) {
      const processQueue = async () => {
        setImages(prev => prev.map(img => 
          img.status === 'pending' ? { ...img, status: 'processing' } : img
        ));

        await Promise.all(pendingImages.map(img => processImage(img, settings)));
      };

      processQueue();
    }
  }, [images, settings, processImage]);

  // Handle new file uploads
  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map(file => ({
      id: generateId(),
      originalFile: file,
      compressedBlob: null,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      compressedSize: 0,
      status: 'pending',
      reduction: 0
    }));

    setImages(prev => [...prev, ...newImages]);
  }, []);

  // Handle setting changes
  const handleSettingsChange = (newSettings: CompressionSettings) => {
    setSettings(newSettings);
    setImages(prev => prev.map(img => ({ ...img, status: 'pending' })));
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
  };

  const downloadAll = async () => {
    const processedImages = images.filter(img => img.status === 'done' && img.compressedBlob);
    
    if (processedImages.length === 0) return;

    const zip = new JSZip();
    processedImages.forEach(img => {
      if (img.compressedBlob) {
        const ext = img.compressedBlob.type.split('/')[1];
        const originalName = img.originalFile.name.substring(0, img.originalFile.name.lastIndexOf('.'));
        zip.file(`${originalName}-min.${ext}`, img.compressedBlob);
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tuyaya-compressed-${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate total stats
  const totalOriginalSize = images.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressedSize = images.reduce((acc, curr) => acc + (curr.compressedSize || curr.originalSize), 0);
  const totalSaved = totalOriginalSize - totalCompressedSize;
  
  const processedCount = images.filter(i => i.status === 'done').length;
  const showDownloadAll = processedCount > 0;

  return (
    <div>
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          {t.title}
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <ControlPanel 
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClearAll={clearAll}
        count={images.length}
        totalSavings={formatBytes(Math.max(0, totalSaved))}
        lang={lang}
      />

      {images.length === 0 ? (
        <Dropzone onFilesAdded={handleFilesAdded} lang={lang} />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {images.map(img => (
              <ImageItem 
                key={img.id} 
                image={img} 
                onRemove={removeImage} 
                lang={lang}
              />
            ))}
          </div>

          {showDownloadAll && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all active:scale-95 font-medium"
              >
                <DownloadCloud size={20} />
                {t.downloadAll} ({processedCount})
              </button>
            </div>
          )}
          
          <div className="mt-8 pt-8 border-t border-slate-200">
            <Dropzone onFilesAdded={handleFilesAdded} lang={lang} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Compressor;
