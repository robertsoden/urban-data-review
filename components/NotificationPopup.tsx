
import React, { useEffect } from 'react';
import { useData } from '../context/DataContext';
import { CheckCircleIcon, XIcon } from './Icons';

const NotificationPopup: React.FC = () => {
  const { notifications, dispatch } = useData();

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: notifications[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notifications, dispatch]);

  if (notifications.length === 0) {
    return null;
  }

  const notification = notifications[0];
  const isSuccess = notification.type === 'success';

  const bgColor = isSuccess ? 'bg-green-500' : 'bg-red-500';
  const Icon = isSuccess ? CheckCircleIcon : XIcon;

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg text-white shadow-lg animate-fade-in-out ${bgColor}`}>
      <div className="flex-shrink-0">
        <Icon />
      </div>
      <div className="ml-3 text-sm font-medium">
        {notification.message}
      </div>
      <button
        onClick={() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id })}
        className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8"
        aria-label="Dismiss"
      >
        <span className="sr-only">Dismiss</span>
        <XIcon className="w-5 h-5" />
      </button>
      <style>{`
        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(-20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationPopup;
