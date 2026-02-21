import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, Mail, RefreshCw, X } from 'lucide-react';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../lib/supabaseApi';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'payment' | 'reminder' | 'invitation' | 'update';
  is_read: boolean;
  related_subscription_id: string | null;
  created_at: string;
}

interface NotificationPanelProps {
  language: 'en' | 'es';
}

const translations = {
  en: {
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    noNotificationsDesc: "You're all caught up!",
    justNow: 'Just now',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    yesterday: 'Yesterday',
  },
  es: {
    notifications: 'Notificaciones',
    markAllRead: 'Marcar todas como leídas',
    noNotifications: 'Sin notificaciones',
    noNotificationsDesc: '¡Estás al día!',
    justNow: 'Ahora mismo',
    hoursAgo: 'h',
    daysAgo: 'd',
    yesterday: 'Ayer',
  },
};

function formatTimeAgo(dateString: string, lang: 'en' | 'es'): string {
  const locale = translations[lang];
  const diff = (Date.now() - new Date(dateString).getTime()) / 1000;
  if (diff < 60) return locale.justNow;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${locale.hoursAgo}`;
  if (diff < 172800) return locale.yesterday;
  return `${Math.floor(diff / 86400)}${locale.daysAgo}`;
}

function NotifIcon({ type }: { type: Notification['type'] }) {
  const map = {
    payment:    { icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-green-100',  color: 'text-green-600'  },
    reminder:   { icon: <Clock       className="w-4 h-4" />, bg: 'bg-orange-100', color: 'text-orange-500' },
    invitation: { icon: <Mail        className="w-4 h-4" />, bg: 'bg-indigo-100', color: 'text-indigo-600' },
    update:     { icon: <RefreshCw   className="w-4 h-4" />, bg: 'bg-blue-100',   color: 'text-blue-600'   },
  };
  const s = map[type] ?? { icon: <AlertCircle className="w-4 h-4" />, bg: 'bg-gray-100', color: 'text-gray-600' };
  return (
    <div className={`w-8 h-8 rounded-full ${s.bg} ${s.color} flex items-center justify-center flex-shrink-0`}>
      {s.icon}
    </div>
  );
}

export function NotificationPanel({ language }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const locale = translations[language];

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications((data as Notification[]) ?? []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Realtime: refresh when any change happens to the notifications table
  useEffect(() => {
    const channel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleClick = async (n: Notification) => {
    if (n.is_read) return;
    try {
      await markNotificationAsRead(n.id);
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{locale.notifications}</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  {locale.markAllRead}
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
            {loading && notifications.length === 0 ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 items-start animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2 text-center px-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-700">{locale.noNotifications}</p>
                <p className="text-sm text-gray-400">{locale.noNotificationsDesc}</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                    !n.is_read ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(n.created_at, language)}
                    </span>
                    {!n.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}