import { useState } from 'react';
import { motion } from 'framer-motion';

const ImageLoader = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

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
