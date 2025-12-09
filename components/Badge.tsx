import React from 'react';

interface BadgeProps {
  text: string;
  colorClass: string;
}

const Badge: React.FC<BadgeProps> = ({ text, colorClass }) => {
  if (!text) return null;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
      {text}
    </span>
  );
};

export const AnnexBadge: React.FC<{ annex: string }> = ({ annex }) => {
  const colorMap: Record<string, string> = {
    'Annex I': 'bg-blue-100 text-blue-800',
    'Annex II': 'bg-green-100 text-green-800',
    'Annex III': 'bg-purple-100 text-purple-800',
  };
  const colorClass = colorMap[annex] || 'bg-gray-100 text-gray-800';
  return <Badge text={annex || 'N/A'} colorClass={colorClass} />;
};

export default Badge;
