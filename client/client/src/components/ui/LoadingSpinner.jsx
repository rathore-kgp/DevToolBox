const LoadingSpinner = ({ fullScreen }) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50"
        style={{ background: '#0d0f17' }}>
        {/* Animated logo */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-2xl shadow-[#7c3aed]/40 mb-2">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </div>
        <div className="spinner" />
        <p className="text-[#545a7a] text-sm">Loading DevToolBox…</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      <div className="spinner" />
    </div>
  );
};

export default LoadingSpinner;