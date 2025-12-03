import React from 'react';
import { ImageFile, Language } from '../types';
import { formatBytes, translations } from '../utils';
import { Download, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';

interface ImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
  lang: Language;
}

const ImageItem: React.FC<ImageItemProps> = ({ image, onRemove, lang }) => {
  const isDone = image.status === 'done';
  const isProcessing = image.status === 'processing';
  const isError = image.status === 'error';
  const t = translations[lang];

  const downloadImage = () => {
    if (!image.compressedBlob) return;
    const url = URL.createObjectURL(image.compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    // Keep extension logic simple for now
    const ext = image.compressedBlob.type.split('/')[1];
    const originalName = image.originalFile.name.substring(0, image.originalFile.name.lastIndexOf('.'));
    link.download = `${originalName}-min.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-4 flex items-center gap-4">
        
        {/* Preview */}
        <div className="relative w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
          <img 
            src={image.previewUrl} 
            alt={image.originalFile.name} 
            className="w-full h-full object-cover"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={24} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-800 truncate" title={image.originalFile.name}>
              {image.originalFile.name}
            </h4>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <span className="font-mono">{formatBytes(image.originalSize)}</span>
              {isDone && (
                <>
                  <ArrowRight size={14} className="mx-2 text-slate-400" />
                  <span className="font-mono font-semibold text-slate-900">
                    {formatBytes(image.compressedSize)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center md:justify-end">
            {isProcessing && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t.compressing}
              </span>
            )}
            {isError && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" title={image.error}>
                <AlertCircle size={12} className="mr-1" /> {t.error}
              </span>
            )}
            {isDone && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${image.reduction > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                {image.reduction > 0 ? `-${image.reduction}%` : t.noReduction}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-l border-slate-100 pl-4 ml-2">
          {isDone && (
            <button
              onClick={downloadImage}
              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title={t.download}
            >
              <Download size={20} />
            </button>
          )}
          <button
            onClick={() => onRemove(image.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title={t.remove}
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageItem;