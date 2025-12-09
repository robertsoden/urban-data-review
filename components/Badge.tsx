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

export const RdlsStatusBadge: React.FC<{ status: boolean }> = ({ status }) => {
    const text = status ? 'Yes' : 'No';
    const colorClass = status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return <Badge text={text} colorClass={colorClass} />;
};

export const CompletionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const colorMap: Record<string, string> = {
        'Complete': 'bg-green-100 text-green-800',
        'In Progress': 'bg-yellow-100 text-yellow-800',
        'Not Started': 'bg-red-100 text-red-800',
    };
    const colorClass = colorMap[status] || 'bg-gray-100 text-gray-800';
    return <Badge text={status} colorClass={colorClass} />;
};

export default Badge;