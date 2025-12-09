const StorySection = ({ player, totalPlayers, onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--color-text-primary)' }}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">StorySection</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>To be implemented in step 06</p>
        <button
          onClick={onComplete}
          className="mt-4 px-4 py-2 rounded"
          style={{ backgroundColor: 'var(--color-accent-green)', color: 'var(--color-bg-primary)' }}
        >
          Skip to Scroll Section
        </button>
      </div>
    </div>
  );
};

export default StorySection;
