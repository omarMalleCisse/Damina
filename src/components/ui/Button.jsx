import React from 'react';

const variants = {
  primary:
    'bg-[#fd4d08] text-white hover:bg-[#e64507] focus:ring-[#fd4d08]/40 shadow-md hover:shadow-lg',
  secondary:
    'bg-white text-gray-900 border-2 border-gray-200 hover:border-[#fd4d08]/50 hover:bg-gray-50',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/40',
  ghost:
    'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
  link:
    'text-[#fd4d08] font-semibold hover:underline bg-transparent border-0 shadow-none'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base'
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  loadingLabel = 'Chargement...',
  className = '',
  as: Component = 'button',
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';
  const classes = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  return (
    <Component type={Component === 'button' ? type : undefined} className={classes} disabled={disabled || loading} {...rest}>
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Component>
  );
};

export default Button;
