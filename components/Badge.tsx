import React from 'react';
import { CompletionStatus, Priority, RdlsStatus } from '../types';

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

export const CompletionStatusBadge: React.FC<{ status: CompletionStatus }> = ({ status }) => {
  const colorMap = {
    [CompletionStatus.Complete]: 'bg-green-100 text-green-800',
    [CompletionStatus.InProgress]: 'bg-yellow-100 text-yellow-800',
    [CompletionStatus.NotStarted]: 'bg-red-100 text-red-800',
  };
  return <Badge text={status} colorClass={colorMap[status]} />;
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
    const colorMap = {
      [Priority.Essential]: 'bg-red-100 text-red-800',
      [Priority.Beneficial]: 'bg-blue-100 text-blue-800',
      [Priority.Low]: 'bg-gray-100 text-gray-800',
      [Priority.Unassigned]: 'bg-gray-100 text-gray-800',
    };
    return <Badge text={priority || 'N/A'} colorClass={colorMap[priority]} />;
};

export const RdlsStatusBadge: React.FC<{ status: RdlsStatus }> = ({ status }) => {
    const colorMap = {
      [RdlsStatus.Yes]: 'bg-green-100 text-green-800',
      [RdlsStatus.No]: 'bg-red-100 text-red-800',
      [RdlsStatus.Partial]: 'bg-yellow-100 text-yellow-800',
      [RdlsStatus.Check]: 'bg-purple-100 text-purple-800',
      [RdlsStatus.Unassigned]: 'bg-gray-100 text-gray-800',
    };
    const textMap = {
        [RdlsStatus.Yes]: "Yes",
        [RdlsStatus.No]: "No",
        [RdlsStatus.Partial]: "Partial",
        [RdlsStatus.Check]: "Check",
        [RdlsStatus.Unassigned]: "N/A"
    };
    return <Badge text={textMap[status]} colorClass={colorMap[status]} />;
}

export default Badge;