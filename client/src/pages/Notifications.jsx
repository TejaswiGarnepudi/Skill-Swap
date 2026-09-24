import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';
import { Bell, UserPlus, BookOpen, CheckCircle, Calendar, MessageSquare } from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Notifications = () => {
  const { notifications: socketNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [socketNotifications]);

  const getIcon = (type) => {
    switch(type) {
      case 'exchange_request': 
      case 'request_accepted':
        return <UserPlus className="text-violet-500" size={18} />;
      case 'group_invite': 
        return <BookOpen className="text-coral-500" size={18} />;
      case 'session_reminder':
        return <Calendar className="text-blue-500" size={18} />;
      case 'new_message':
        return <MessageSquare className="text-green-500" size={18} />;
      default: 
        return <Bell className="text-gray-500" size={18} />;
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const markSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-card border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-plum-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated on exchange requests, group activity, and sessions.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <Button variant="ghost" onClick={markAllRead} className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} /> Mark all read
          </Button>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div 
                key={notif._id} 
                onClick={() => !notif.read && markSingleRead(notif._id)}
                className={`p-5 flex gap-4 items-start ${!notif.read ? 'bg-violet-50/40 cursor-pointer' : 'hover:bg-lavender-50/40'} transition-colors`}
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center justify-center flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-plum-900 text-sm">{notif.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    {new Date(notif.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2.5 h-2.5 bg-coral-500 rounded-full mt-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-lavender-50 rounded-full flex items-center justify-center mx-auto mb-4 text-violet-300">
              <Bell size={28} />
            </div>
            <h3 className="text-lg font-bold text-plum-900">All caught up!</h3>
            <p className="text-gray-400 text-sm mt-1">You don't have any notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
