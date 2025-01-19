// src/components/LanguageSwitcher.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="relative inline-block">
      <select
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        value={i18n.language}
        className="appearance-none bg-transparent text-white border border-white rounded-lg px-4 py-2 cursor-pointer hover:bg-white hover:text-black transition-colors"
      >
        <option value="en" className="text-black">English</option>
        <option value="zh" className="text-black">中文</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
        </svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;