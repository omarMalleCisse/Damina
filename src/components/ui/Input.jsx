import React from 'react';

const inputBase =
  'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/30 focus:border-[#fd4d08]/50 transition';

export const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  className = '',
  ...rest
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <input
      id={name}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`${inputBase} ${error ? 'border-red-400' : ''}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...rest}
    />
    {error && (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
);

export const Textarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
  error,
  className = '',
  ...rest
}) => (
  <div className={className}>
    {label && (
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`${inputBase} resize-y min-h-[80px] ${error ? 'border-red-400' : ''}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
      {...rest}
    />
    {error && (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
);

export default Input;
