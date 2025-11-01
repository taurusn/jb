'use client';

import React, { forwardRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outline';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      variant = 'default',
      className = '',
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // Base input styles
    const baseStyles = `
      px-4 py-3 rounded-lg
      font-medium text-base
      transition-all duration-300 ease-out
      focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-brand-dark
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${icon ? (iconPosition === 'left' ? 'pl-12' : 'pr-12') : ''}
    `;

    // Variant styles
    const variantStyles = {
      default: `
        bg-dark-400 border-2 border-dark-300 text-brand-light
        hover:border-brand-yellow/50
        focus:border-brand-yellow focus:bg-dark-300
        placeholder:text-gray-400
      `,
      filled: `
        bg-dark-300 border-2 border-transparent text-brand-light
        hover:bg-dark-200
        focus:bg-dark-400 focus:border-brand-yellow
        placeholder:text-gray-400
      `,
      outline: `
        bg-transparent border-2 border-brand-yellow text-brand-light
        hover:bg-brand-yellow/5
        focus:bg-brand-yellow/10 focus:border-primary-400
        placeholder:text-gray-400
      `,
    };

    // Error styles
    const errorStyles = error
      ? 'border-accent-red focus:ring-accent-red focus:border-accent-red'
      : '';

    const inputClassName = `
      ${baseStyles}
      ${variantStyles[variant]}
      ${errorStyles}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-semibold text-brand-light mb-2">
            {label}
            {props.required && <span className="text-brand-yellow ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div
              className={`
                absolute top-1/2 -translate-y-1/2
                ${iconPosition === 'left' ? 'left-4' : 'right-4'}
                text-gray-400 transition-colors duration-300
                ${isFocused ? 'text-brand-yellow' : ''}
              `}
            >
              {icon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={inputClassName}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
        </div>

        {/* Helper Text or Error */}
        {(helperText || error) && (
          <p
            className={`mt-1.5 text-sm ${
              error ? 'text-accent-red animate-slide-down' : 'text-gray-400'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
