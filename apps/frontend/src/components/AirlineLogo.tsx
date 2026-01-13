import React from 'react';

interface AirlineLogoProps {
  flightNumber: string;
  className?: string;
}

const airlineColors: Record<string, { bg: string; text: string }> = {
  FR: { bg: 'bg-blue-600', text: 'text-yellow-300' }, // Ryanair
  EI: { bg: 'bg-green-700', text: 'text-white' },      // Aer Lingus
  BA: { bg: 'bg-indigo-900', text: 'text-white' },   // British Airways
  UA: { bg: 'bg-sky-700', text: 'text-white' },      // United Airlines
  AA: { bg: 'bg-slate-500', text: 'text-white' },   // American Airlines
  LH: { bg: 'bg-yellow-400', text: 'text-slate-900' }, // Lufthansa
  AF: { bg: 'bg-blue-800', text: 'text-white' },      // Air France
  EK: { bg: 'bg-red-700', text: 'text-white' },      // Emirates
  IB: { bg: 'bg-red-600', text: 'text-yellow-400' }, // Iberia
  VY: { bg: 'bg-yellow-500', text: 'text-slate-900' }, // Vueling
  DEFAULT: { bg: 'bg-slate-200', text: 'text-slate-600' },
};

export const AirlineLogo: React.FC<AirlineLogoProps> = ({ flightNumber, className = 'h-6 w-6' }) => {
  const airlineCode = flightNumber ? flightNumber.substring(0, 2).toUpperCase() : '';
  const colors = airlineColors[airlineCode] || airlineColors.DEFAULT;

  if (!airlineCode) {
    return <div className={`${className} ${colors.bg} rounded-full`}></div>;
  }

  return (
    <div
      className={`${className} ${colors.bg} ${colors.text} rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm`}
      title={airlineCode}
    >
      {airlineCode}
    </div>
  );
};