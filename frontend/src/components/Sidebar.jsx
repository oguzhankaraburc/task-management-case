import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShieldCheck,
    LogOut,
    CalendarRange,
    UserCircle,
    Settings,
    Moon,
    Sun,
    Bell,
    User,
    Briefcase,
    CheckCircle,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';
import getAvatarUrl from '../utils/avatarHelper';
import { useTheme } from '../context/ThemeContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileModal, setShowProfileModal] = useState(false);

    const menuGroups = [
        {
            title: '',
            items: [
                {
                    name: 'Görev Paneli',
                    icon: LayoutDashboard,
                    path: '/dashboard',
                    show: true
                },
                {
                    name: 'Takvim',
                    icon: CalendarRange,
                    path: '/calendar',
                    show: true
                },
                {
                    name: 'Analiz',
                    icon: Activity,
                    path: '/analytics',
                    show: true
                },
            ]
        },
        {
            title: 'Yönetim',
            show: user?.role === 'Admin',
            items: [
                {
                    name: 'Kullanıcı Yönetimi',
                    icon: User,
                    path: '/admin/users',
                    show: true
                },
                {
                    name: 'Proje Merkezi',
                    icon: Briefcase,
                    path: '/admin/projects',
                    show: true
                },
                {
                    name: 'Görev Denetimi',
                    icon: CheckCircle,
                    path: '/admin/tasks',
                    show: true
                },
            ]
        },
    ];

    return (
        <>
            <aside className="w-64 h-screen fixed left-0 top-0 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col z-50 shadow-sm transition-colors duration-400">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 transition-all">
                            <CalendarRange className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-black text-[var(--text-main)] tracking-tight leading-tight">Task<br />Management</span>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-7 mt-2 overflow-y-auto custom-scrollbar">
                    {menuGroups.filter(group => group.show !== false).map((group, groupIdx) => (
                        <div key={groupIdx} className="space-y-2">
                            <h3 className="px-5 text-[10px] font-black text-[var(--text-muted)] opacity-60 uppercase tracking-[0.2em] mb-3">
                                {group.title}
                            </h3>
                            <div className="space-y-1.5">
                                {group.items.filter(item => item.show).map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => navigate(item.path)}
                                            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-[15px] font-bold transition-all duration-200 border border-transparent ${isActive
                                                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 shadow-sm border-primary-100 dark:border-primary-500/20 scale-[1.02]'
                                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)] hover:shadow-sm'
                                                }`}
                                        >
                                            <item.icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'opacity-50'}`} />
                                            <span className="text-[13px] tracking-tight">{item.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-5 mt-auto space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between px-5 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[20px] transition-all hover:shadow-md group/theme"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
                                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </div>
                            <span className="text-[13px] font-bold text-[var(--text-main)]">
                                {isDarkMode ? 'Karanlık Tema' : 'Aydınlık Tema'}
                            </span>
                        </div>
                        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-primary-600' : 'bg-[var(--border-color)]'}`}>
                            <motion.div
                                animate={{ x: isDarkMode ? 20 : 2 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </div>
                    </button>

                    <div className="w-full bg-[var(--bg-main)] rounded-3xl p-4 border border-[var(--border-color)] flex items-center gap-3 group/profile transition-all">
                        <div className="w-9 h-9 bg-[var(--bg-surface)] rounded-xl flex items-center justify-center border border-[var(--border-color)] shadow-sm overflow-hidden flex-shrink-0">
                            {user?.avatarUrl ? (
                                <img src={getAvatarUrl(user.avatarUrl)} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs font-black text-primary-600 uppercase">
                                    {user?.username?.[0] || <UserCircle className="w-5 h-5 text-slate-400" />}
                                </span>
                            )}
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-black text-[var(--text-main)] truncate uppercase tracking-tight">{user?.username}</p>
                        </div>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="p-2 hover:bg-[var(--bg-surface)] rounded-xl border border-transparent hover:border-[var(--border-color)] transition-all group/settings"
                            title="Profil ayarları"
                        >
                            <Settings className="w-4 h-4 text-[var(--text-muted)] group-hover/settings:text-primary-500 group-hover/settings:rotate-90 transition-all duration-300" />
                        </button>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[var(--bg-surface)] border border-red-100 dark:border-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        </>
    );
};

export default Sidebar;
