import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../services/notification.service';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socket.service';

const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (err) {
            console.error('Bildirimler yüklenemedi:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();

            socketService.connect(user.id);


            socketService.onNotification((newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            return () => {
                socketService.disconnect();
            };
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PROJECT_ASSIGN': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case 'TASK_ASSIGN': return <Info className="w-4 h-4 text-primary-500" />;
            case 'TASK_OVERDUE': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            default: return <Bell className="w-4 h-4 text-slate-400" />;
        }
    };

    const handleNotificationClick = (n) => {
        handleMarkAsRead(n.id);
        if (n.type === 'PROJECT_ASSIGN') navigate('/admin/projects');
        if (n.type.startsWith('TASK')) navigate('/dashboard');
        setShowPanel(false);
    };

    return (
        <header className="fixed top-0 right-0 left-72 h-20 z-[9999] flex items-center justify-end px-10 pointer-events-none">
            <div className="relative pointer-events-auto" ref={panelRef}>
                <button
                    onClick={() => setShowPanel(!showPanel)}
                    className="p-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group relative"
                >
                    <Bell className={`w-5 h-5 text-[var(--text-muted)] group-hover:text-primary-500 transition-colors ${unreadCount > 0 ? 'animate-none' : ''}`} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--bg-surface)] rounded-full animate-pulse" />
                    )}
                </button>

                <AnimatePresence>
                    {showPanel && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-0 mt-4 w-96 bg-[var(--bg-surface)]/80 backdrop-blur-xl border border-[var(--border-color)] rounded-[32px] shadow-2xl overflow-hidden z-50"
                        >
                            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-black text-[var(--text-main)] uppercase tracking-tight">BİLDİRİMLER</h4>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 bg-primary-500 text-white text-[10px] font-black rounded-full leading-none">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors"
                                >
                                    TÜMÜNÜ OKUNDU YAP
                                </button>
                            </div>

                            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Bell className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                                        <p className="text-[var(--text-muted)] font-bold text-xs uppercase tracking-widest opacity-50">Henüz bildirim yok.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                onClick={() => handleNotificationClick(n)}
                                                className={`p-5 border-b border-[var(--border-color)] flex gap-4 transition-all cursor-pointer group ${!n.isRead ? 'bg-primary-500/5' : 'hover:bg-[var(--bg-main)]/50'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${!n.isRead ? 'bg-[var(--bg-surface)] border-primary-500/20' : 'bg-[var(--bg-main)] border-[var(--border-color)]'}`}>
                                                    {getIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <h5 className={`text-xs font-black uppercase tracking-tight truncate ${!n.isRead ? 'text-primary-600' : 'text-[var(--text-main)]'}`}>
                                                            {n.title}
                                                        </h5>
                                                        <button
                                                            onClick={(e) => handleDelete(e, n.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-[var(--text-muted)] mt-1.5 leading-relaxed">
                                                        {n.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">
                                                            {new Date(n.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                                                                ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                                : new Date(n.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-[var(--bg-main)]/50 text-center">
                                <button
                                    onClick={() => setShowPanel(false)}
                                    className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-widest transition-all"
                                >
                                    KAPAT
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;
