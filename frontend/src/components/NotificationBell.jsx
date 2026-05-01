import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Clock, AlertCircle, Trash2, Mail } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case "completion":
        return <CheckCircle size={14} className="text-green-500" />;
      case "deadline":
        return <AlertCircle size={14} className="text-red-500" />;
      case "pending":
        return <Clock size={14} className="text-orange-500" />;
      case "assigned":
        return <Mail size={14} className="text-blue-500" />;
      default:
        return <Bell size={14} className="text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200 relative group"
      >
        <Bell size={18} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-indigo-700 dark:border-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="mx-auto text-gray-200 dark:text-slate-800 mb-2" />
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => !n.isRead && markAsRead(n._id)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative ${
                      !n.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                    }`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                    )}
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg bg-gray-100 dark:bg-slate-800 flex-shrink-0 h-fit`}>
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs leading-relaxed ${!n.isRead ? "font-bold text-gray-800 dark:text-slate-100" : "text-gray-600 dark:text-slate-400"}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 text-center">
            <button className="text-[10px] font-bold text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 uppercase tracking-wider">
              View all activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
