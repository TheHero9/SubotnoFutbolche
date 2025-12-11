import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Select, { SingleValue, StylesConfig } from 'react-select';
import type { PlayerSelectProps } from '../types';

interface OptionType {
  value: string;
  label: string;
}

const PlayerSelect: React.FC<PlayerSelectProps> = ({ players, onSelect }) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<SingleValue<OptionType>>(null);

  const options: OptionType[] = players.map(player => ({
    value: player.name,
    label: player.name
  }));

  const handleSelect = (): void => {
    if (selectedOption) {
      onSelect(selectedOption.value);
    }
  };

  const customStyles: StylesConfig<OptionType, false> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#282828',
      borderColor: '#1db954',
      color: '#ffffff',
      padding: '8px',
      fontSize: '18px',
      cursor: 'pointer',
      '&:hover': {
        borderColor: '#1db954'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#282828',
      border: '1px solid #1db954'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#1db954' : '#282828',
      color: '#ffffff',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#1db954'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#ffffff'
    }),
    input: (provided) => ({
      ...provided,
      color: '#ffffff'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#b3b3b3'
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      {/* Floating footballs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl opacity-10"
            animate={{
              y: [-20, 20, -20],
              x: [0, 10, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 15}%`
            }}
          >
            ⚽
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full relative z-10"
      >
        {/* Title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-4 gradient-text"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t('landing.title')}
        </motion.h1>

        <motion.p
          className="text-xl text-center mb-12"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t('landing.subtitle')}
        </motion.p>

        {/* Player selector */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Select<OptionType>
            options={options}
            value={selectedOption}
            onChange={setSelectedOption}
            placeholder={t('landing.searchPlaceholder')}
            styles={customStyles}
            isSearchable
            className="mb-6"
          />

          <motion.button
            onClick={handleSelect}
            disabled={!selectedOption}
            className="w-full py-4 px-8 rounded-lg text-xl font-bold transition-all"
            style={{
              backgroundColor: selectedOption ? 'var(--color-accent-green)' : 'var(--color-bg-card)',
              color: selectedOption ? 'var(--color-bg-primary)' : 'var(--color-text-secondary)',
              cursor: selectedOption ? 'pointer' : 'not-allowed'
            }}
            whileHover={selectedOption ? { scale: 1.02 } : {}}
            whileTap={selectedOption ? { scale: 0.98 } : {}}
            onMouseEnter={(e) => {
              if (selectedOption) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-gold)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedOption) {
                e.currentTarget.style.backgroundColor = 'var(--color-accent-green)';
              }
            }}
          >
            {t('landing.selectButton')}
          </motion.button>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          className="text-center text-4xl mt-8"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚽
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PlayerSelect;
