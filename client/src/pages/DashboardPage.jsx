import { Link } from 'react-router-dom';

const TOOLS = [
  {
    to: '/json',
    label: 'JSON Tools',
    description: 'Format, validate, minify & export JSON data instantly.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h10M7 16h10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
      </svg>
    ),
    gradient: 'from-[#7c3aed] to-[#06b6d4]',
    glow: 'rgba(124,58,237,0.2)',
    badge: 'Ready',
    badgeClass: 'badge-green',
  },
  {
    to: '/encoding',
    label: 'Encoding Tools',
    description: 'Base64 encode/decode, hash generation (SHA-1/256/512), and UUID generation.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    gradient: 'from-[#ec4899] to-[#7c3aed]',
    glow: 'rgba(236,72,153,0.2)',
    badge: 'Ready',
    badgeClass: 'badge-green',
  },
  {
    to: '/regex',
    label: 'Regex Tester',
    description: 'Test and debug regular expressions with real-time match highlighting.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    gradient: 'from-[#f59e0b] to-[#ec4899]',
    glow: 'rgba(245,158,11,0.15)',
    badge: 'Ready',
    badgeClass: 'badge-green',
  },
  {
    to: '/jwt',
    label: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens — header, payload, and signature.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    gradient: 'from-[#06b6d4] to-[#10b981]',
    glow: 'rgba(6,182,212,0.15)',
    badge: 'Ready',
    badgeClass: 'badge-green',
  },

  {
    to: '/api-tester',
    label: 'API Tester',
    description: 'Send HTTP requests with a built-in proxy — like a mini Postman.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-[#10b981] to-[#06b6d4]',
    glow: 'rgba(16,185,129,0.15)',
    badge: 'Ready',
    badgeClass: 'badge-green',
  },
  {
    to: '/curl',
    label: 'cURL Converter',
    description: 'Convert cURL commands into Axios or Fetch code in one click.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-[#f59e0b] to-[#ec4899]',
    glow: 'rgba(245,158,11,0.15)',
    badge: 'Ready',
    badgeClass: 'badge-green',
  },
  {
    to: '#',
    label: 'URL Tools',
    description: 'Encode, decode, and parse URLs and query parameters.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    gradient: 'from-[#7c3aed] to-[#ec4899]',
    glow: 'rgba(124,58,237,0.15)',
    badge: 'Coming soon',
    badgeClass: 'badge-brand',
  },
];

const STATS = [
  { label: 'Tools Available', value: '6', suffix: '+' },
  { label: 'Runs in Browser', value: '100', suffix: '%' },
  { label: 'Data Stored', value: '0', suffix: 'B' },
];

const DashboardPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* ─── Hero section ─── */}
      <div className="relative overflow-hidden rounded-2xl p-8 border border-[#2d3148]"
        style={{ background: 'linear-gradient(135deg, #161926 0%, #1c1f2e 60%, rgba(124,58,237,0.08) 100%)' }}>
        {/* Decorative orb */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#7c3aed]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-[#06b6d4]/8 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.25)] text-[#a06efd] text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a06efd] animate-pulse" />
            Developer Toolkit
          </div>

          <h1 className="text-4xl font-bold gradient-text mb-3">
            Welcome to DevToolBox
          </h1>
          <p className="text-[#6e758f] text-lg max-w-xl leading-relaxed">
            A collection of powerful developer utilities. Most tools run entirely
            in your browser — no uploads, no tracking. Some features use a secure
            backend proxy.
          </p>

          <div className="flex items-center gap-6 mt-6">
            {STATS.map(({ label, value, suffix }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{value}<span className="text-[#a06efd]">{suffix}</span></p>
                <p className="text-xs text-[#545a7a] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Tools grid ─── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#d8dbe8]">All Tools</h2>
          <span className="badge badge-cyan text-[11px]">{TOOLS.length} total</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map(({ to, label, description, icon, gradient, glow, badge, badgeClass }) => {
            const isReady = badge === 'Ready';
            const CardWrapper = ({ children }) =>
              isReady ? (
                <Link to={to} className="group card relative overflow-hidden hover:scale-[1.02] transition-transform duration-200 block" style={{ '--glow': glow }}>
                  {children}
                </Link>
              ) : (
                <div className="group card relative overflow-hidden opacity-60 cursor-not-allowed">
                  {children}
                </div>
              );

            return (
              <CardWrapper key={label}>
                {/* Glow effect */}
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: glow }}
                />

                <div className="relative z-10 flex flex-col h-full gap-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                      style={{ boxShadow: `0 8px 20px ${glow}` }}>
                      {icon}
                    </div>
                    <span className={`badge ${badgeClass} text-[11px]`}>{badge}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-[#d8dbe8] text-base mb-1.5 group-hover:text-[#f0e7ff] transition-colors">{label}</h3>
                    <p className="text-sm text-[#6e758f] leading-relaxed">{description}</p>
                  </div>

                  {isReady && (
                    <div className="flex items-center gap-1.5 text-[#a06efd] text-sm font-medium">
                      Open tool
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardWrapper>
            );
          })}
        </div>
      </div>

      {/* ─── Footer note ─── */}
      <div className="text-center py-4">
        <p className="text-xs text-[#3d4263]">
          Most tools run entirely in your browser · API Tester &amp; JWT verification use a secure backend proxy
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;