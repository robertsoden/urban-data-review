import React, { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => {
    return <h2 className={`text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4 ${className}`}>{children}</h2>
}

export default Card;
