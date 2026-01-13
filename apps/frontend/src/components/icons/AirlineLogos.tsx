import React from 'react';

// Default/Fallback Logo
export const GenericPlaneLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400" {...props}>
        <path d="M10.22 8.54 6.71 5.03a.75.75 0 0 0-1.06 1.06l3.51 3.51-1.99 1.99a.75.75 0 0 0 0 1.06l1.06 1.06a.75.75 0 0 0 1.06 0l1.99-1.99 3.51 3.51a.75.75 0 0 0 1.06-1.06l-3.51-3.51 1.99-1.99a.75.75 0 0 0 0-1.06l-1.06-1.06a.75.75 0 0 0-1.06 0l-1.99 1.99Z"/>
        <path d="m11.5 1.58-.55.56a.75.75 0 0 0 0 1.06l.55.55L9.6 6.2a.75.75 0 0 0-1.06 0l-.55-.55a.75.75 0 0 0-1.06 0l-.56.55a.75.75 0 0 0 0 1.06l.56.56L3.9 10.74a.75.75 0 0 0 0 1.06l.55.55a.75.75 0 0 0 1.06 0l.55-.55a.75.75 0 0 0 0-1.06l-2.04-2.04 2.05-2.05.55.55a.75.75 0 0 0 1.06 0l.55-.55a.75.75 0 0 0 0-1.06L6.2 3.6l2.45-2.45.55.55a.75.75 0 0 0 1.06 0l.55-.55a.75.75 0 0 0 0-1.06L10.27.53a.75.75 0 0 0-1.06 0l-.56.55a.75.75 0 0 0 0 1.06l.56.56L6.71 5.1l2.04 2.04 2.04-2.04-.55-.55a.75.75 0 0 0-1.06 0l-.55.55a.75.75 0 0 0 0 1.06l.55.55 2.04 2.04 2.5-2.5.55.55a.75.75 0 0 0 1.06 0l.55-.55a.75.75 0 0 0 0-1.06l-.55-.56a.75.75 0 0 0-1.06 0l-.55.56-2.5 2.5-2.05-2.04L13.8 2.65l.55-.55a.75.75 0 0 0 0-1.06l-.55-.56a.75.75 0 0 0-1.06 0l-.55.56a.75.75 0 0 0 0 1.06l.55.55L9.6 6.2l-2.04-2.04L10.05 1.6a.75.75 0 0 0 1.06 0l.55-.55a.75.75 0 0 0-1.06-1.06Z" transform="translate(6.5 6.5)"/>
    </svg>
);


// Airline Specific Logos

export const AmericanAirlinesLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 50 25" {...props}>
        <path d="M25 0C10 0 0 15 0 15L25 15Z" fill="#D82A2B"/>
        <path d="M25 25C40 25 50 10 50 10L25 10Z" fill="#0078D2"/>
    </svg>
);

export const IberiaLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <path d="M 50,20 A 30,30 0 0 1 50,80" fill="none" stroke="#D4002A" strokeWidth="15" />
        <path d="M 50,20 A 30,30 0 0 0 50,80" fill="none" stroke="#FFC400" strokeWidth="15" />
    </svg>
);

export const VuelingLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" {...props}>
        <rect width="100" height="100" rx="20" fill="#666" />
        <text x="50" y="65" fontFamily="Arial, sans-serif" fontSize="50" fill="white" fontWeight="bold" textAnchor="middle">VY</text>
        <circle cx="80" cy="20" r="10" fill="#FECB00" />
    </svg>
);

export const AerLingusLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#00624D">
          <path transform="rotate(15 50 50)" d="M50 15 C30 15, 30 50, 50 50 C30 50, 30 85, 50 85 C70 85, 70 50, 50 50 C70 50, 70 15, 50 15"/>
          <path transform="rotate(15 50 50)" d="M48 50 H 52 V 90 H 48 Z"/>
        </g>
    </svg>
);

export const RyanairLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" {...props}>
    <path fill="#fdd528" d="M79.5,62.3c0.1-2.2,0.2-4.3,0.2-6.5c0-13.8-3.4-26.3-9.5-36.4c-2-3.3-4.5-6.1-7.4-8.4c-0.2-0.2-0.5-0.2-0.7,0 c-2.9,2.3-5.4,5.1-7.4,8.4c-6.1,10.1-9.5,22.6-9.5,36.4c0,2.2,0.1,4.3,0.2,6.5H25v7.2h21.4c-0.1,2.1-0.2,4.2-0.2,6.3 c0,13.8,3.4,26.3,9.5,36.4c2,3.3,4.5,6.1,7.4,8.4c0.2,0.2,0.5,0.2,0.7,0c2.9-2.3,5.4-5.1,7.4-8.4c6.1-10.1,9.5-22.6,9.5-36.4 c0-2.1-0.1-4.2-0.2-6.3H96v-7.2H79.5z M65.8,55.8c0-8.9-2.1-17-6-23.5c-1.5-2.5-3.2-4.6-5.1-6.4c-1.9,1.8-3.6,3.9-5.1,6.4 c-3.9,6.5-6,14.6-6,23.5c0,8.9,2.1,17,6,23.5c1.5,2.5,3.2,4.6,5.1,6.4c1.9-1.8,3.6,3.9,5.1-6.4C63.7,72.9,65.8,64.8,65.8,55.8z" />
  </svg>
);


export const BritishAirwaysLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M20 50 Q 50 20, 80 50 L 80 30 Q 50 0, 20 30 Z" fill="#BA0C2F"/>
        <path d="M20 50 Q 50 80, 80 50 L 80 70 Q 50 100, 20 70 Z" fill="#003366"/>
    </svg>
);

export const UnitedAirlinesLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 200 60" {...props}>
    <path fill="#00528B" d="M100,0 C44.8,0 0,22.4 0,50 L0,60 L200,60 L200,50 C200,22.4 155.2,0 100,0 Z" />
    <path fill="#FFFFFF" d="M100,10 C144.2,10 180,27.9 180,50 L20,50 C20,27.9 55.8,10 100,10 Z" />
    <path fill="#002D5A" d="M100,20 C133.1,20 160,33.4 160,50 L40,50 C40,33.4 66.9,20 100,20 Z" />
  </svg>
);

export const LufthansaLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 128 128" {...props}>
    <circle cx="64" cy="64" r="56" fill="#05164d"/>
    <path fill="#ffb700" d="m64 32.3-2.1 1.6c-4.8 3.7-8.5 8-11.2 12.8-2.6 4.6-4.3 9.6-4.9 14.8-1.5 13.1 3.2 26.5 13.4 34.5l4.8 3.8 4.8-3.8c10.2-8 14.9-21.4 13.4-34.5-0.6-5.2-2.2-10.2-4.9-14.8-2.7-4.8-6.4-9.1-11.2-12.8l-2.1-1.6zm-21.2 39.5c-1-0.1-1.9-0.3-2.8-0.6-3-1-5.1-3.8-5.2-7 0-0.4 0-0.8 0.1-1.2l6.1-23.9 8.2 2.1-5 19.8c-0.2 0.7-0.1 1.5 0.3 2.1 0.5 0.7 1.3 1.1 2.1 1.1h0.2l12-3.1-2.1 8.2-13.9 3.5zm-5.7-37.4 5 19.8-8.2-2.1-6.1-23.9c-0.6-2.2 0.3-4.6 2-5.9 1.8-1.4 4.2-1.6 6.2-0.5l1.1 0.6zm33.1 34.3-13.9-3.5-2.1-8.2 12 3.1h0.2c0.8 0 1.6-0.4 2.1-1.1 0.5-0.7 0.5-1.5 0.3-2.1l-5-19.8 8.2-2.1 6.1 23.9c0.1 0.4 0.1 0.8 0.1 1.2-0.1 3.2-2.2 6-5.2 7-0.9 0.3-1.8 0.5-2.8 0.6zm1-38-6.1 23.9-8.2 2.1 5-19.8 1.1-0.6c2-1.1 4.5-0.8 6.2 0.5 1.8 1.3 2.6 3.7 2 5.9z" />
  </svg>
);

export const AirFranceLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 150 30" {...props}>
        <text x="5" y="22" fontFamily="Verdana, sans-serif" fontSize="20" fill="#002140" fontWeight="bold">AIRFRANCE</text>
        <path d="M125 5 C 140 5, 135 25, 150 25" stroke="#AF1E2D" fill="none" strokeWidth="3" />
    </svg>
);

export const EmiratesLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 500 100" {...props}>
    <text x="90" y="60" fontFamily="Arial, Helvetica, sans-serif" fontSize="30" fill="#d9222a" fontWeight="bold">
        Emirates
    </text>
    <path fill="#d9222a" d="M108.4,51.2h-2.1l-2.1-3.4h-13v3.4h-2.2V38.7h2.2v3.2h13l2.1-3.2h2.1L104,45L108.4,51.2z M104.2,41.9h-13v6.2h13 L104.2,41.9z M123.5,51.2h-2.2V38.7h8.8c3.6,0,6.2,2.3,6.2,6.2c0,3.9-2.6,6.2-6.2,6.2h-6.5V51.2z M123.5,49h6.5 c2.4,0,4-1.6,4-4c0-2.3-1.6-4-4-4h-6.5V49z M149.2,51.2h-2.2V38.7h2.2V51.2z M168.3,51.2h-8.8V38.7h2.2v10.3h6.6V51.2z M186.2,45c0,3.9,2.6,6.2,6.2,6.2c3.6,0,6.2-2.3,6.2-6.2c0-3.9-2.6-6.2-6.2-6.2C188.8,38.7,186.2,41.1,186.2,45z M196.4,45 c0,2.7-1.6,4-4,4c-2.4,0-4-1.3-4-4c0-2.7,1.6-4,4-4C194.8,41.1,196.4,42.3,196.4,45z M215.3,51.2h-8.8V38.7h2.2v10.3h6.6 V51.2z" transform="translate(100 0) scale(0.6)"/>
  </svg>
);

export const EtihadLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 200 40" {...props}>
      <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="30" fill="#B9975B" fontWeight="bold">ETIHAD</text>
      <path d="M0 35 H 200" stroke="#6F4E37" strokeWidth="2"/>
    </svg>
);

export const QantasLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" {...props}>
      <path fill="#E60000" d="M95,50 C95,25.1,74.9,5,50,5 C25.1,5,5,25.1,5,50 C5,74.9,25.1,95,50,95 C74.9,95,95,74.9,95,50 Z"/>
      <path fill="#FFFFFF" d="M72.3,27.7 L34.7,27.7 C29.4,27.7,25.4,32.4,26.1,37.6 L34.2,81.1 L39,78.5 C43,76.2,47,76.2,51,78.5 L55.8,81.1 L63.9,37.6 C64.6,32.4,60.6,27.7,55.3,27.7 L55.3,27.7 L72.3,27.7 Z"/>
  </svg>
);