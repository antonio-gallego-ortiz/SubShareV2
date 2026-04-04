import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'payment_completed' | 'payment_pending' | 'payment_due';
  title: string;
  description: string;
  amount?: number;
  date: string;
  isRead: boolean;
}

interface NotificationPanelProps {
  language: 'en' | 'es';
}

const translations = {
  en: {
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    noNotificationsDesc: 'You\'re all caught up!',
    paymentCompleted: 'Payment completed',
    paymentPending: 'Payment pending',
    paymentDue: 'Payment due soon',
    viewAll: 'View all payments',
    justNow: 'Just now',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    yesterday: 'Yesterday',
    today: 'Today'
  },
  es: {
    notifications: 'Notificaciones',
    markAllRead: 'Marcar todas como leídas',
    noNotifications: 'Sin notificaciones',
    noNotificationsDesc: '¡Estás al día!',
    paymentCompleted: 'Pago completado',
    paymentPending: 'Pago pendiente',
    paymentDue: 'Pago próximo',
    viewAll: 'Ver todos los pagos',
    justNow: 'Justo ahora',
    hoursAgo: 'horas',
    daysAgo: 'días',
    yesterday: 'Ayer',
    today: 'Hoy'
  }
};

// Datos de ejemplo de notificaciones
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment_completed',
    title: 'Sarah Miller paid for Netflix Premium',
    description: 'Payment of $5.00 received successfully',
    amount: 5.00,
    date: '2023-10-15T14:30:00',
    isRead: false
  },
  {
    id: '2',
    type: 'payment_pending',
    title: 'Bob Jenkins - Netflix Premium',
    description: 'Payment of $5.00 is pending',
    amount: 5.00,
    date: '2023-10-15T10:00:00',
    isRead: false
  },
  {
    id: '3',
    type: 'payment_due',
    title: 'Spotify Family renewal',
    description: 'Your share of $2.83 is due in 3 days',
    amount: 2.83,
    date: '2023-10-15T09:00:00',
    isRead: false
  },
  {
    id: '4',
    type: 'payment_completed',
    title: 'Charlie Davis paid for YouTube Premium',
    description: 'Payment of $4.60 received successfully',
    amount: 4.60,
    date: '2023-10-14T16:20:00',
    isRead: true
  },
  {
    id: '5',
    type: 'payment_due',
    title: 'Netflix Premium renewal',
    description: 'Your share of $5.00 is due on Oct 24',
    amount: 5.00,
    date: '2023-10-14T08:00:00',
    isRead: true
  }
];

export function NotificationPanel({ language }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Cerrar panel al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t.justNow;
    if (diffInHours < 24) return `${diffInHours} ${t.hoursAgo}`;
    if (diffInHours < 48) return t.yesterday;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${t.daysAgo}`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'payment_completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'payment_pending':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'payment_due':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'payment_completed':
        return 'bg-green-100';
      case 'payment_pending':
        return 'bg-orange-100';
      case 'payment_due':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{t.notifications}</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {t.markAllRead}
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-gray-900 mb-1">{t.noNotifications}</p>
                <p className="text-sm text-gray-500">{t.noNotificationsDesc}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 ${getNotificationBgColor(notification.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.date)}
                        </span>
                        {notification.amount && (
                          <span className="text-sm font-semibold text-gray-900">
                            ${notification.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}