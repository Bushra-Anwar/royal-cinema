import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-bold transition-all rounded-xl cursor-pointer disabled:opacity-50';
  const variants = {
    primary: 'bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-md shadow-orange-500/20',
    secondary: 'bg-[#FFF7ED] hover:bg-[#ffedd5] text-[#EA580C] border border-[#fed7aa]',
    outline: 'bg-white hover:bg-[#FFF7ED] text-[#24170F] border border-[#F1E4D8]'
  };
  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3'
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};
