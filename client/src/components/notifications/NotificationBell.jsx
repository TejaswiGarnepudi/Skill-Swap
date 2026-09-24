import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

const NotificationBell = () => {
  const { notifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-gray-500 hover:bg-lavender-100 hover:text-plum-900 transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-coral-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-semibold text-plum-900">Notifications</h3>
              <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-xs text-violet-600 hover:text-violet-800">
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No new notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((notif, idx) => (
                  <div key={idx} className="p-4 border-b border-gray-50 hover:bg-lavender-50 transition-colors">
                    <p className="text-sm font-medium text-plum-900">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
