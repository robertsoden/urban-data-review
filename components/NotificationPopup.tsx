import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircleIcon, XIcon } from './Icons';

const NotificationPopup: React.FC = () => {
  const { notifications } = useData();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-5 right-5 z-50 space-y-3 w-full max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            relative w-full rounded-md shadow-lg p-4 flex items-start
            ${notification.type === 'success' ? 'bg-green-50 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 text-red-800' : ''}
          `}
        >
          <div className="shrink-0">
            {notification.type === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
            {notification.type === 'error' && <XIcon className="w-6 h-6 text-red-500" />}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="mt-1 text-sm">
              {notification.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPopup;
