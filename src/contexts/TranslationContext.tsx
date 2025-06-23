import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lingoService } from '../lib/lingoApi';

interface TranslationContextType {
  currentLanguage: string;
  translations: Record<string, string>;
  isLoading: boolean;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize with user's preferred language
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      try {
        const preferredLanguage = lingoService.getUserPreferredLanguage();
        setCurrentLanguage(preferredLanguage);
        
        if (preferredLanguage !== 'en') {
          const appTranslations = await lingoService.translateAppStrings(preferredLanguage);
          setTranslations(appTranslations);
        } else {
          // Load default English strings
          const englishStrings = await lingoService.translateAppStrings('en');
          setTranslations(englishStrings);
        }
      } catch (error) {
        console.warn('Failed to initialize translations:', error);
        // Fallback to English
        const englishStrings = await lingoService.translateAppStrings('en');
        setTranslations(englishStrings);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = async (languageCode: string): Promise<void> => {
    if (languageCode === currentLanguage) return;

    setIsLoading(true);
    try {
      // Save user preference
      lingoService.setUserPreferredLanguage(languageCode);
      
      // Load new translations
      const newTranslations = await lingoService.translateAppStrings(languageCode);
      
      setCurrentLanguage(languageCode);
      setTranslations(newTranslations);
      
      console.log(`✅ Language changed to: ${languageCode}`);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  const contextValue: TranslationContextType = {
    currentLanguage,
    translations,
    isLoading,
    changeLanguage,
    t,
    supportedLanguages: lingoService.getSupportedLanguages(),
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}; 