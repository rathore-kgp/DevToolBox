// src/utils/statusColors.js
export const getStatusColor = (status) => {
  if (!status) return 'text-[#545a7a]';
  if (status < 300) return 'text-[#10b981]';
  if (status < 400) return 'text-[#f59e0b]';
  if (status < 500) return 'text-[#f97316]';
  return 'text-[#f87171]';
};

export const getStatusBg = (status) => {
  if (!status) return 'bg-[#545a7a]/10';
  if (status < 300) return 'bg-[#10b981]/10';
  if (status < 400) return 'bg-[#f59e0b]/10';
  if (status < 500) return 'bg-[#f97316]/10';
  return 'bg-[#f87171]/10';
};