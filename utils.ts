import { Language } from './types';

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const getReductionPercentage = (original: number, compressed: number): number => {
  if (original === 0) return 0;
  const reduction = ((original - compressed) / original) * 100;
  return Math.round(reduction * 10) / 10; // Round to 1 decimal
};

export const translations = {
  zh: {
    title: "图片批量压缩",
    subtitle: "在浏览器本地压缩 JPG、PNG 和 WEBP 图片。无需上传服务器，隐私更安全。",
    cropTitle: "图片裁剪工具",
    cropSubtitle: "简单易用的在线图片裁剪。支持 JPG、PNG、WEBP。",
    gifTitle: "GIF 动图裁剪",
    gifSubtitle: "在线裁剪 GIF 动态图。上传 GIF，框选区域，即可生成裁剪后的图片。",
    inspiredBy: "Tbox导航",
    tudingNav: "图钉AI导航",
    dragDrop: "拖拽图片或文件夹到这里",
    drop: "松开鼠标上传",
    support: "支持 JPG, PNG, WEBP。图片在浏览器本地进行智能压缩。",
    supportGif: "仅支持 GIF 格式图片。",
    selectBtn: "选择图片",
    selectFolder: "选择文件夹",
    quality: "质量",
    high: "高",
    medium: "中",
    low: "低",
    outputFormat: "输出格式",
    original: "原格式",
    saved: "已节省",
    clearAll: "清空全部",
    compressing: "压缩中...",
    processing: "处理中...",
    error: "错误",
    noReduction: "无体积减少",
    download: "下载",
    remove: "移除",
    downloadAll: "批量下载",
    footer: "© 2024 图压压. 基于 React & Tailwind 构建。",
    modeCompress: "图片压缩",
    modeCrop: "图片裁剪",
    modeGifCrop: "GIF裁剪",
    cropRatio: "比例",
    ratioFree: "自由",
    ratio11: "1:1",
    ratio169: "16:9",
    ratio43: "4:3",
    applyCrop: "裁剪并下载",
    cancel: "取消",
    cropDrag: "拖拽裁剪框调整大小",
    unsupportedFile: "不支持的文件格式",
  },
  en: {
    title: "Smart Image Compression",
    subtitle: "Compress JPG, PNG, and WEBP images locally in your browser. No server uploads, better privacy.",
    cropTitle: "Image Cropping Tool",
    cropSubtitle: "Easy online image cropping. Supports JPG, PNG, WEBP.",
    gifTitle: "GIF Cropping Tool",
    gifSubtitle: "Online animated GIF cropping. Upload, select area, and download.",
    inspiredBy: "Tbox Navigation",
    tudingNav: "TuDing AI Navigation",
    dragDrop: "Drag & drop images or folders here",
    drop: "Drop items here",
    support: "Support JPG, PNG, WEBP. Images are compressed locally in your browser.",
    supportGif: "Supports GIF format only.",
    selectBtn: "Select Images",
    selectFolder: "Select Folder",
    quality: "Quality",
    high: "High",
    medium: "Medium",
    low: "Low",
    outputFormat: "Output Format",
    original: "Original",
    saved: "Saved",
    clearAll: "Clear All",
    compressing: "Compressing...",
    processing: "Processing...",
    error: "Error",
    noReduction: "No reduction",
    download: "Download",
    remove: "Remove",
    downloadAll: "Download All",
    footer: "© 2024 TuYaYa. Built with React & Tailwind.",
    modeCompress: "Compression",
    modeCrop: "Cropping",
    modeGifCrop: "GIF Cropping",
    cropRatio: "Ratio",
    ratioFree: "Free",
    ratio11: "1:1",
    ratio169: "16:9",
    ratio43: "4:3",
    applyCrop: "Crop & Download",
    cancel: "Cancel",
    cropDrag: "Drag frame to crop",
    unsupportedFile: "Unsupported file format",
  }
};