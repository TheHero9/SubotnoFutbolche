import React from 'react';

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #121212 50%, #0a0a0a 100%)'
        }}
      />

      {/* Static gradient orbs - no animation for performance */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #1db954 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
          filter: 'blur(80px)'
        }}
      />

      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, #9333ea 0%, transparent 70%)',
          bottom: '10%',
          left: '-15%',
          filter: 'blur(80px)'
        }}
      />

      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #ffd700 0%, transparent 70%)',
          top: '40%',
          right: '20%',
          filter: 'blur(60px)'
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
