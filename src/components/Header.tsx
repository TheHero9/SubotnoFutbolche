import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HeaderProps } from '../types';
import LanguageToggle from './LanguageToggle';

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const { t } = useTranslation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.7)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <button
          onClick={onReset}
          className="text-xl font-bold transition-colors"
          style={{ color: 'var(--color-accent-green)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent-gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-accent-green)'}
        >
          {t('header.title')}
        </button>

        <LanguageToggle />
      </div>
    </header>
  );
};

export default Header;
