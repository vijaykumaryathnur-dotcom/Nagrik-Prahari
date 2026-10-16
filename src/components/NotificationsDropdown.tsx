import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { AppNotification } from '../types/database';

export const NotificationsDropdown: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15);

      if (!error && data) {
        setNotifications(data as AppNotification[]);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Supabase Realtime subscription for instant alerts
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as AppNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('Could not mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Could not mark all read:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#51606F] hover:text-[#0F2A47] hover:bg-[#D9D4C7]/20 rounded transition-colors"
        aria-label={`Notifications, ${unreadCount} unread`}
      >
        <Bell className="w-5 h-5 stroke-[1.8]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-[#B7791F] rounded-full tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D9D4C7] rounded shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#FAF8F3] border-b border-[#D9D4C7]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#51606F]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-[#175CD3] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#D9D4C7]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#51606F]">
                No recent notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 text-xs transition-colors flex items-start gap-2.5 ${
                    n.read ? 'bg-white opacity-80' : 'bg-[#FAF8F3] font-medium'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-[#0F2A47] leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#51606F]">
                      <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      {n.report_id && (
                        <Link
                          to={`/reports/${n.report_id}`}
                          onClick={() => {
                            markAsRead(n.id);
                            setIsOpen(false);
                          }}
                          className="text-[#175CD3] hover:underline"
                        >
                          View report &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <button
                      onClick={(e) => markAsRead(n.id, e)}
                      title="Mark as read"
                      className="p-1 text-[#51606F] hover:text-[#0F2A47] rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
