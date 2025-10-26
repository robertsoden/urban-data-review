import React from 'react';
import { useData } from '../context/DataContext';

const NotificationPopup: React.FC = () => {
  const { state } = useData();
  const { notifications } = state;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      {notifications.map(notification => {
        const bgColor = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';
        return (
          <div
            key={notification.id}
            className={`${bgColor} text-white p-3 rounded-lg shadow-lg mb-2 animate-fade-in-out`}
          >
            {notification.message}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationPopup;
