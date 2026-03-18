'use client';

import Link from 'next/link';

interface GradientButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outlined';
  className?: string;
  type?: 'button' | 'submit';
}

export function GradientButton({
  children,
  href,
  onClick,
  size = 'md',
  variant = 'primary',
  className = '',
  type = 'button',
}: GradientButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-sand-50 dark:focus:ring-offset-[#0E0F12] min-h-[44px]';

  const variantClasses =
    variant === 'primary'
      ? 'bg-pharaonic text-white border border-accent-gold/40 hover:shadow-gold-glow hover:border-accent-gold active:scale-[0.98]'
      : 'bg-transparent text-sand-800 dark:text-stone-200 border-2 border-sand-300 dark:border-stone-600 hover:border-accent-gold dark:hover:border-[#E9C25A] hover:text-sand-900 dark:hover:text-white active:scale-[0.98]';

  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
