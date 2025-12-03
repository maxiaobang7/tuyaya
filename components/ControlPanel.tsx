import React from 'react';
import { CompressionSettings, Language } from '../types';
import { Settings, RefreshCw, Trash2, Download } from 'lucide-react';
import { translations } from '../utils';

interface ControlPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (newSettings: CompressionSettings) => void;
  onClearAll: () => void;
  totalSavings: string;
  count: number;
  lang: Language;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  settings, 
  onSettingsChange, 
  onClearAll,
  totalSavings,
  count,
  lang
}) => {
  const t = translations[lang];

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      quality: parseFloat(e.target.value),
    });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...settings,
      outputFormat: e.target.value as CompressionSettings['outputFormat'],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-8 sticky top-4 z-10">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        
        {/* Quality Controls */}
        <div className="flex-1 space-y-4 md:space-y-0 md:flex md:gap-8 md:items-center">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <Settings size={16} className="mr-2" />
                {t.quality}: {Math.round(settings.quality * 100)}%
              </label>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-100 text-primary-700">
                {settings.quality > 0.8 ? t.high : settings.quality > 0.5 ? t.medium : t.low}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.quality}
              onChange={handleQualityChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t.outputFormat}
            </label>
            <div className="relative">
              <select
                value={settings.outputFormat}
                onChange={handleFormatChange}
                className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 px-3 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              >
                <option value="original">{t.original}</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Stats */}
        {count > 0 && (
          <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
             <div className="text-right mr-2 hidden lg:block">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.saved}</p>
              <p className="text-lg font-bold text-green-600">{totalSavings}</p>
            </div>
            
            <button
              onClick={onClearAll}
              className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 size={18} className="mr-2" />
              {t.clearAll}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
