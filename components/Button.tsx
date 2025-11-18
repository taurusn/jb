'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  vibrate?: boolean;
}

// Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      vibrate = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles for all buttons
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-lg
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow
      disabled:opacity-50 disabled:cursor-not-allowed
      transform active:scale-98
      ${fullWidth ? 'w-full' : ''}
      ${vibrate ? 'vibrate-on-hover' : ''}
    `;

    // Variant styles
    const variantStyles = {
      primary: `
        bg-brand-yellow text-brand-dark
        hover:bg-yellow-400
        active:bg-yellow-500
      `,
      secondary: `
        bg-dark-400 text-brand-light border border-dark-300
        hover:bg-dark-300 hover:border-brand-yellow/50
        active:bg-dark-500
      `,
      outline: `
        bg-transparent text-brand-yellow border-2 border-brand-yellow
        hover:bg-brand-yellow/10
        active:bg-brand-yellow/20
      `,
      ghost: `
        bg-transparent text-brand-light
        hover:bg-dark-400 hover:text-brand-yellow
        active:bg-dark-500
      `,
      danger: `
        bg-accent-red text-white
        hover:bg-red-600
        active:bg-red-700
      `,
    };

    // Size styles
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5',
      xl: 'px-8 py-4 text-xl gap-3',
    };

    const combinedClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${sizeStyles[size]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={combinedClassName}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="inline-flex items-center">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="inline-flex items-center">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
