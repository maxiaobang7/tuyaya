import React, { useState } from 'react';
import { Language, AppMode } from './types';
import { translations } from './utils';
import { Zap, Compass, Globe, MapPin, Crop, Image as ImageIcon, Film } from 'lucide-react';
import Compressor from './components/Compressor';
import Cropper from './components/Cropper';
import GifCropper from './components/GifCropper';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('zh');
  const [mode, setMode] = useState<AppMode>('compress');
  const t = translations[lang];

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between relative">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {lang === 'zh' ? '图压压' : 'TuYaYa'}
            </h1>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="hidden md:flex bg-slate-100 p-1 rounded-lg absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={() => setMode('compress')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'compress' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ImageIcon size={16} />
              {t.modeCompress}
            </button>
            <button
              onClick={() => setMode('crop')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'crop' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Crop size={16} />
              {t.modeCrop}
            </button>
            <button
              onClick={() => setMode('gif-crop')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'gif-crop' 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Film size={16} />
              {t.modeGifCrop}
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <a 
              href="https://www.tboxn.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors hidden lg:flex items-center gap-2 text-sm font-medium"
            >
              <Compass size={18} />
              <span className="hidden xl:inline">{t.inspiredBy}</span>
            </a>

            <a 
              href="https://www.tudingai.com/" 
              target="_blank" 
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors hidden lg:flex items-center gap-2 text-sm font-medium"
            >
              <MapPin size={18} />
              <span className="hidden xl:inline">{t.tudingNav}</span>
            </a>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-50 rounded-full transition-colors border border-slate-200"
            >
              <Globe size={16} />
              <span>{lang === 'zh' ? 'EN' : '中文'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-slate-100 flex">
           <button
              onClick={() => setMode('compress')}
              className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                mode === 'compress' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                  : 'border-transparent text-slate-500'
              }`}
            >
              <ImageIcon size={16} />
              {t.modeCompress}
            </button>
            <button
              onClick={() => setMode('crop')}
              className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                mode === 'crop' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                  : 'border-transparent text-slate-500'
              }`}
            >
              <Crop size={16} />
              {t.modeCrop}
            </button>
             <button
              onClick={() => setMode('gif-crop')}
              className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                mode === 'gif-crop' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                  : 'border-transparent text-slate-500'
              }`}
            >
              <Film size={16} />
              {t.modeGifCrop}
            </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {mode === 'compress' && <Compressor lang={lang} />}
        {mode === 'crop' && <Cropper lang={lang} />}
        {mode === 'gif-crop' && <GifCropper lang={lang} />}
      </main>
      
      <footer className="text-center text-slate-400 py-8 text-sm">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
};

export default App;