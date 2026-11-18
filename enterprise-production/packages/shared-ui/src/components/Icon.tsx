import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 32,
};

export interface StandardIconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon;
  size?: IconSize | number;
  className?: string;
}

/**
 * Standardized Royal Cinema ERP Lucide Icon component.
 * Ensures consistent stroke width (1.85), standard sizing tiers, and proper inline alignment.
 */
export const Icon: React.FC<StandardIconProps> = ({
  icon: IconComponent,
  size = 'md',
  strokeWidth = 1.85,
  className = '',
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || 18;

  return (
    <IconComponent
      size={pixelSize}
      strokeWidth={strokeWidth}
      className={`inline-block align-middle shrink-0 ${className}`}
      {...props}
    />
  );
};
