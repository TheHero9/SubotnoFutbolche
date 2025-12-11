import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ImageLoaderProps } from '../types';

const ImageLoader: React.FC<ImageLoaderProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  return (
    <div className="relative">
      {!isLoaded && (
        <div
          className={`${className} animate-pulse`}
          style={{ backgroundColor: 'var(--color-bg-card)' }}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        className={className}
        onLoad={() => setIsLoaded(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export default ImageLoader;
