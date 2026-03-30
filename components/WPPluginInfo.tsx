import React from 'react';
import { Language } from '../types';
import { translations } from '../utils';
import { Github, ExternalLink, CheckCircle2, Layout, Zap, Image as ImageIcon } from 'lucide-react';

interface WPPluginInfoProps {
  lang: Language;
}

const WPPluginInfo: React.FC<WPPluginInfoProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 md:p-12 bg-gradient-to-br from-primary-50 to-white border-b border-slate-100">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap size={14} />
                WordPress Plugin
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                {t.wpTitle}
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
                {t.wpSubtitle}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <a
                  href="https://github.com/maxiaobang7/WP-Image-Compress-Upload"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                >
                  <Github size={20} />
                  {t.wpGithub}
                </a>
              </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-primary-100/50 rounded-full blur-2xl"></div>
                <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                  <Layout size={80} className="text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{lang === 'zh' ? '原生压缩' : 'Native Compression'}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t.wpFeature1}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ImageIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{lang === 'zh' ? 'WebP 转换' : 'WebP Conversion'}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t.wpFeature2}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <ExternalLink size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{lang === 'zh' ? '自动插入' : 'Auto Insertion'}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t.wpFeature3}</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
              <Layout size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{lang === 'zh' ? '无缝集成' : 'Seamless Integration'}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t.wpFeature4}</p>
            </div>
          </div>
        </div>

        {/* Screenshot Section */}
        <div className="px-8 pb-12 md:px-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img 
                src="https://picui.ogmua.cn/s1/2026/03/30/69c9e75a30bf6.webp" 
                alt="WP Plugin Screenshot" 
                className="w-full h-auto block"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/maxiaobang7/WP-Image-Compress-Upload/main/screenshot.png';
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-xs italic">
                {lang === 'zh' ? '插件演示截图 - WordPress Gutenberg 编辑器侧边栏' : 'Plugin Demo Screenshot - WordPress Gutenberg Editor Sidebar'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Call to Action */}
      <div className="mt-12 text-center">
        <h4 className="text-xl font-bold text-slate-900 mb-4">{lang === 'zh' ? '准备好提升你的 WordPress 体验了吗？' : 'Ready to enhance your WordPress experience?'}</h4>
        <p className="text-slate-500 mb-8">{lang === 'zh' ? '立即前往 GitHub 获取最新版本，开启高效创作之旅。' : 'Head over to GitHub to get the latest version and start your efficient creation journey.'}</p>
        <a
          href="https://github.com/maxiaobang7/WP-Image-Compress-Upload"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-100"
        >
          <Github size={20} />
          {t.wpGithub}
        </a>
      </div>
    </div>
  );
};

export default WPPluginInfo;
