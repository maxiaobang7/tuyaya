import React, { useCallback, useRef, useState } from 'react';
import { Upload, Image as ImageIcon, FolderPlus } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  lang: Language;
  accept?: string; // e.g. "image/gif" or "image/*"
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, lang, accept = "image/*" }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Recursive function to traverse FileSystemEntry
  const traverseFileTree = async (item: any, path = ''): Promise<File[]> => {
    if (item.isFile) {
      return new Promise((resolve) => {
        item.file((file: File) => resolve([file]));
      });
    } else if (item.isDirectory) {
      const dirReader = item.createReader();
      return new Promise((resolve) => {
        const entries: File[] = [];
        const readEntries = () => {
          dirReader.readEntries(async (result: any[]) => {
            if (result.length === 0) {
              resolve(entries);
            } else {
              const promises = result.map(entry => traverseFileTree(entry, path + item.name + '/'));
              const files = await Promise.all(promises);
              entries.push(...files.flat());
              readEntries(); // Continue reading because readEntries might not return all files at once
            }
          });
        };
        readEntries();
      });
    }
    return [];
  };

  const isValidFile = (file: File) => {
    if (accept === "image/*") return file.type.startsWith('image/');
    // Handle specific types like "image/gif"
    if (accept === "image/gif") return file.type === "image/gif";
    // General fallback
    return file.type.startsWith('image/');
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const items = e.dataTransfer.items;
      if (items && items.length > 0) {
        const files: File[] = [];
        const promises: Promise<File[]>[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i].webkitGetAsEntry();
          if (item) {
            promises.push(traverseFileTree(item));
          } else {
            // Fallback for non-webkit browsers if needed, though most support it now
            const file = items[i].getAsFile();
            if (file) files.push(file);
          }
        }

        const nestedFiles = await Promise.all(promises);
        const allFiles = [...files, ...nestedFiles.flat()];
        
        const validFiles = allFiles.filter(isValidFile);
        if (validFiles.length > 0) {
          onFilesAdded(validFiles);
        }
      } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Fallback for simple file drop
        const fileList = Array.from(e.dataTransfer.files) as File[];
        const validFiles = fileList.filter(isValidFile);
        onFilesAdded(validFiles);
      }
    },
    [onFilesAdded, accept]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files) as File[];
      const validFiles = fileList.filter(isValidFile);
      onFilesAdded(validFiles);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const isGifOnly = accept === "image/gif";

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative w-full rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer group
        ${
          isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50 bg-white'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {/* Folder Input - Disable for GIF mode if desired, but keep for consistency */}
      <input
        type="file"
        multiple
        // @ts-ignore
        webkitdirectory=""
        directory=""
        ref={folderInputRef}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className={`
          p-4 rounded-full mb-4 transition-colors duration-300
          ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500'}
        `}>
          {isDragging ? <Upload size={40} /> : <ImageIcon size={40} />}
        </div>
        
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          {isDragging ? t.drop : t.dragDrop}
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto mb-6">
          {isGifOnly ? t.supportGif : t.support}
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95"
          >
            {t.selectBtn}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              folderInputRef.current?.click();
            }}
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <FolderPlus size={18} />
            {t.selectFolder}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;