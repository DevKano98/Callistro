import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Button = forwardRef(({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  isLoading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ariaLabel,
  role = 'button',
  ...props
}, ref) => {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';
  
  const sizes = {
    xs: 'px-2.5 py-1 text-xs gap-1',
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-7 py-4 text-lg gap-3'
  };

    const getStyle = (variant) => {
      const styles = {
        primary: {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          '--tw-shadow': 'var(--shadow-sm)',
          '--hover-bg': 'var(--color-primary-hover)',
        },
        secondary: {
          backgroundColor: '#FFFFFF',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          '--hover-bg': 'var(--color-surface-light)',
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'var(--color-primary)',
          border: '2px solid var(--color-primary)',
          '--hover-bg': 'var(--color-surface-light)',
        },
        success: {
          backgroundColor: 'var(--color-success)',
          color: '#FFFFFF',
          '--hover-bg': 'var(--color-success)',
        },
        danger: {
          backgroundColor: 'var(--color-danger)',
          color: '#FFFFFF',
          '--hover-bg': 'var(--color-danger)',
        },
        ghost: {
          backgroundColor: 'transparent',
          color: 'var(--color-text-secondary)',
          '--hover-bg': 'var(--color-surface-light)',
          '--hover-color': 'var(--color-text)',
        },
        link: {
          backgroundColor: 'transparent',
          color: 'var(--color-primary)',
          padding: 0,
          '--hover-color': 'var(--color-primary-hover)',
        },
      };

      return {
        ...styles[variant],
        '&:hover': {
          backgroundColor: 'var(--hover-bg)',
          color: 'var(--hover-color)',
        },
        '&:focus': {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--color-primary)',
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      };
    };

  const spinnerSize = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  // Loading spinner component
  const Spinner = () => (
    <svg 
      className={`animate-spin ${spinnerSize[size]} text-current`}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
  className={`${base} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
  style={getStyle(variant)}
      aria-label={ariaLabel || typeof children === 'string' ? children : undefined}
      aria-disabled={disabled || isLoading}
      role={role}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="inline-flex">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'success', 'danger', 'ghost', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  fullWidth: PropTypes.bool,
  ariaLabel: PropTypes.string,
  role: PropTypes.string,
};

Button.displayName = 'Button';

export default Button;
