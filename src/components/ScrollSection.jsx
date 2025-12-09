const ScrollSection = ({ player, totalPlayers }) => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ color: 'var(--color-text-primary)' }}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">ScrollSection</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>To be implemented in step 07</p>
        {player && <p className="mt-4">Player: {player.name}</p>}
      </div>
    </div>
  );
};

export default ScrollSection;
