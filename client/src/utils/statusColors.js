// src/utils/statusColors.js
export const getStatusColor = (status) => {
  if (!status) return 'text-gray-500';
  if (status < 300) return 'text-green-500';
  if (status < 400) return 'text-yellow-500';
  if (status < 500) return 'text-orange-500';
  return 'text-red-500';
};