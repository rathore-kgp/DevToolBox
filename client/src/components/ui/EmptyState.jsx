const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#1c1f2e] border border-[#2d3148] flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-[#d8dbe8] font-semibold text-base mb-2">{title}</h3>
      <p className="text-[#545a7a] text-sm max-w-xs leading-relaxed">{description}</p>
    </div>
  );
};

export default EmptyState;