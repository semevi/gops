import React from 'react';

export const TimeBadge: React.FC<{ time?: string; type: 'scheduled' | 'estimated' | 'actual' | 'slot' }> = ({ time, type }) => {
  // Robust check for valid date first
  if (!time) {
    return <span className="text-slate-400 w-[45px] inline-block text-center">-</span>;
  }

  const date = new Date(time);
  if (isNaN(date.getTime())) {
      return <span className="text-slate-400 w-[45px] inline-block text-center">-</span>;
  }
  
  const formattedTime = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const colors = {
    scheduled: 'bg-slate-100 text-slate-800',
    estimated: 'bg-teal-100 text-teal-800',
    actual: 'bg-green-100 text-green-800 font-bold',
    slot: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-medium rounded-full w-[45px] inline-block text-center ${colors[type]}`}>
      {formattedTime}
    </span>
  );
};