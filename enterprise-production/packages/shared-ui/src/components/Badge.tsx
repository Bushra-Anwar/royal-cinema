import React from 'react';

export interface BadgeProps {
  status: 'active' | 'expired' | 'pending' | 'warning' | 'info';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const styles = {
    active: 'bg-green-50 text-green-700 border-green-200',
    expired: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[status]}`}>
      {children}
    </span>
  );
};
