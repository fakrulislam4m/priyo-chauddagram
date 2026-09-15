import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ 
  size = 'md', 
  showText = false, 
  textColor = 'text-slate-900',
  className = '' 
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base font-bold' },
    md: { icon: 38, text: 'text-lg font-bold' },
    lg: { icon: 54, text: 'text-2xl font-bold' },
    xl: { icon: 80, text: 'text-3xl font-extrabold' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg 
        width={currentSize.icon} 
        height={currentSize.icon} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="deepTealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="bluePaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>

        {/* Outer Circular Shield (Deep Teal & Pale Blue Rim) */}
        <circle cx="50" cy="50" r="48" fill="url(#deepTealGrad)" />
        <circle cx="50" cy="50" r="44" stroke="url(#bluePaleGrad)" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
        
        {/* Inner Peaceful White Arch */}
        <circle cx="50" cy="50" r="39" fill="#ffffff" />

        {/* Vibrant Rising Sun in Orange (symbol of progress and warmth) */}
        <circle cx="50" cy="46" r="16" fill="url(#orangeGrad)" />

        {/* Green Lush Hills & Delta (symbol of rural beauty & pride) */}
        <path 
          d="M16 66 C 26 50, 42 50, 52 64 C 62 48, 76 50, 84 66 L 84 80 C 84 80, 50 86, 16 80 Z" 
          fill="url(#greenGrad)" 
        />

        {/* Traditional Bengalee River stream in pale blue */}
        <path 
          d="M38 78 C 45 71, 55 72, 62 78" 
          stroke="#0284c7" 
          strokeWidth="3" 
          strokeLinecap="round" 
        />

        {/* Golden Chauddagram Crescent Spark */}
        <path 
          d="M48 24 L52 24 L50 18 Z" 
          fill="#f59e0b" 
        />
        <circle cx="50" cy="30" r="2.5" fill="#f59e0b" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span className={`${currentSize.text} ${textColor} tracking-tight font-['Hind_Siliguri',sans-serif]`}>
            প্রিয় চৌদ্দগ্রাম
          </span>
          <span className="text-[11px] font-medium tracking-wide text-teal-800 uppercase">
            Priyo Chauddagram
          </span>
        </div>
      )}
    </div>
  );
};
