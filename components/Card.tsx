import React, { ReactNode, HTMLAttributes } from 'react';

const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-neutral-200 ${className}`}
    {...props}
  />
);

const CardHeader: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`p-4 sm:p-6 border-b border-neutral-200 ${className}`} {...props} />
);

const CardTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={`text-lg font-semibold text-neutral-800 ${className}`} {...props} />
);

const CardContent: React.FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={`p-4 sm:p-6 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };
