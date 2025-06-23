import React, { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage, supportedLanguages, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangData = supportedLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="kit-glass flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
      >
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentLangData?.nativeName || 'English'}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 kit-card shadow-lg z-50">
          <div className="py-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
              Select Language
            </div>
            <div className="max-h-64 overflow-y-auto">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-gray-900">
                      {language.nativeName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {language.name}
                    </span>
                  </div>
                  {currentLanguage === language.code && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSelector; 