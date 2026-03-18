interface PharaonicDividerProps {
  variant?: 'lotus' | 'papyrus' | 'simple';
  className?: string;
}

export function PharaonicDivider({ variant = 'simple', className = '' }: PharaonicDividerProps) {
  if (variant === 'simple') {
    return (
      <div className={`w-full max-w-4xl mx-auto py-4 ${className}`}>
        <div
          className="h-px w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #d4a853, transparent)',
          }}
        />
      </div>
    );
  }

  if (variant === 'lotus') {
    return (
      <div className={`w-full max-w-4xl mx-auto py-6 flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 400 24"
          className="w-full max-w-md h-6"
          fill="none"
          role="img"
          aria-label="Decorative lotus divider"
        >
          {/* Left line */}
          <line x1="0" y1="12" x2="160" y2="12" stroke="#d4c8b5" strokeWidth="1" />
          {/* Lotus center */}
          <path
            d="M180 4 C185 4, 190 2, 200 2 C210 2, 215 4, 220 4 C215 8, 210 14, 200 18 C190 14, 185 8, 180 4Z"
            fill="none"
            stroke="#d4a853"
            strokeWidth="1.5"
          />
          <path
            d="M190 6 C195 6, 198 5, 200 5 C202 5, 205 6, 210 6 C208 10, 205 14, 200 16 C195 14, 192 10, 190 6Z"
            fill="#d4a853"
            opacity="0.2"
          />
          <circle cx="200" cy="9" r="2" fill="#d4a853" opacity="0.5" />
          {/* Right line */}
          <line x1="240" y1="12" x2="400" y2="12" stroke="#d4c8b5" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  // papyrus variant
  return (
    <div className={`w-full max-w-4xl mx-auto py-6 flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 400 20"
        className="w-full max-w-md h-5"
        fill="none"
        role="img"
        aria-label="Decorative papyrus divider"
      >
        <line x1="0" y1="10" x2="170" y2="10" stroke="#d4c8b5" strokeWidth="1" />
        {/* Papyrus scroll ends */}
        <circle cx="185" cy="10" r="3" stroke="#d4a853" strokeWidth="1.5" fill="none" />
        <circle cx="200" cy="10" r="2" fill="#d4a853" opacity="0.4" />
        <circle cx="215" cy="10" r="3" stroke="#d4a853" strokeWidth="1.5" fill="none" />
        <line x1="230" y1="10" x2="400" y2="10" stroke="#d4c8b5" strokeWidth="1" />
      </svg>
    </div>
  );
}
