const ToolLayout = ({ title, description, children, icon }) => (
  <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
    {/* Page header */}
    <div className="flex items-start gap-4 pb-6 border-b border-[#1c1f2e]">
      {icon && (
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-[#7c3aed]/20">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-[#f0e7ff] tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-[#6e758f] mt-1 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
    {children}
  </div>
);

export default ToolLayout;