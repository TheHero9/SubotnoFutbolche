import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = (): void => {
    const newLang = i18n.language === 'bg' ? 'en' : 'bg';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        color: 'var(--color-text-primary)'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(29, 185, 84, 0.2)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-card)'}
    >
      {i18n.language === 'bg' ? 'EN' : 'BG'}
    </button>
  );
};

export default LanguageToggle;
