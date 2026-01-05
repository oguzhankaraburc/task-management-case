import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    AlertCircle,
    CheckCircle,
    Flag,
    X,
    Layout
} from 'lucide-react';
import taskService from '../services/task.service';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import getAvatarUrl from '../utils/avatarHelper';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [hoveredTask, setHoveredTask] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const { user } = useAuth();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await taskService.getAllTasks();

            const filteredData = user?.role === 'Admin'
                ? data
                : data.filter(t => t.assignedUserId === user?.id);

            setTasks(filteredData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysCount = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);

        const days = [];

        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                day: prevMonthLastDay - i,
                month: month - 1,
                year: year,
                currentMonth: false
            });
        }

        for (let i = 1; i <= daysCount; i++) {
            days.push({
                day: i,
                month: month,
                year: year,
                currentMonth: true
            });
        }

        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                month: month + 1,
                year: year,
                currentMonth: false
            });
        }

        return days;
    }, [currentDate]);

    const getTasksForDay = (day, month, year) => {
        return tasks.filter(task => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            if (!dueDate) return false;
            return dueDate.getDate() === day &&
                dueDate.getMonth() === month &&
                dueDate.getFullYear() === year;
        });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-500';
            case 'Medium': return 'bg-amber-500';
            case 'Low': return 'bg-primary-500';
            default: return 'bg-[var(--text-muted)] opacity-50';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Done': return 'bg-emerald-500';
            case 'Overdue': return 'bg-red-500 animate-pulse ring-2 ring-red-500/20';
            case 'In Progress': return 'bg-amber-500';
            case 'Todo': return 'bg-primary-500';
            default: return 'bg-[var(--text-muted)] opacity-50';
        }
    };

    const handleMouseMove = (e) => {
        setTooltipPos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tight flex items-center gap-4">
                        <CalendarIcon className="w-10 h-10 text-primary-500" />
                        TAKVİM
                    </h2>
                    <p className="text-[var(--text-muted)] font-bold mt-2 uppercase tracking-widest text-xs opacity-60">Görevlerini takvim üzerinden takip et</p>
                </div>

                <div className="flex items-center gap-4 bg-[var(--bg-surface)] p-2 rounded-[24px] border border-[var(--border-color)] shadow-sm">
                    <button
                        onClick={prevMonth}
                        className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-all hover:shadow-sm text-[var(--text-muted)] hover:text-primary-500"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-6 text-sm font-black text-[var(--text-main)] uppercase tracking-widest min-w-[160px] text-center">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </div>
                    <button
                        onClick={nextMonth}
                        className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-all hover:shadow-sm text-[var(--text-muted)] hover:text-primary-500"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-[var(--bg-surface)] rounded-[48px] border border-[var(--border-color)] shadow-2xl p-8 overflow-hidden">
                <div className="grid grid-cols-7 gap-4 mb-6">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => (
                        <div key={day} className="text-center text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest py-2 opacity-60">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-4">
                    {calendarDays.map((date, idx) => {
                        const dayTasks = getTasksForDay(date.day, date.month, date.year);
                        const isToday = new Date().toDateString() === new Date(date.year, date.month, date.day).toDateString();

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.01 }}
                                className={`min-h-[140px] p-4 rounded-[32px] transition-all relative group
                                    ${date.currentMonth ? 'bg-[var(--bg-surface)] border-[var(--border-color)]' : 'bg-[var(--bg-main)]/50 border-transparent opacity-40'}
                                    ${isToday ? 'ring-2 ring-primary-500 shadow-xl shadow-primary-500/10' : 'border shadow-sm'}
                                    hover:shadow-xl hover:-translate-y-1`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className={`text-sm font-black ${isToday ? 'text-primary-600' : 'text-[var(--text-muted)]'}`}>
                                        {date.day}
                                    </span>
                                    <div className="flex gap-1">
                                        {dayTasks.map(t => (
                                            <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${getStatusColor(t.status)}`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {dayTasks.slice(0, 3).map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => setSelectedTask(task)}
                                            onMouseEnter={() => setHoveredTask(task)}
                                            onMouseLeave={() => setHoveredTask(null)}
                                            onMouseMove={handleMouseMove}
                                            className="w-full text-left p-2 rounded-xl bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] transition-colors group/task relative border border-transparent hover:border-[var(--border-color)]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)} shrink-0`} />
                                                <p className="text-[10px] font-bold text-[var(--text-main)] truncate opacity-80">{task.title}</p>
                                            </div>
                                            {task.status === 'Overdue' && (
                                                <div className="absolute inset-0 bg-red-100/20 dark:bg-red-500/10 rounded-xl ring-1 ring-red-500/30" />
                                            )}
                                        </button>
                                    ))}
                                    {dayTasks.length > 3 && (
                                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest pl-2">
                                            +{dayTasks.length - 3} DAHA
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Task Detail Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTask(null)}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--bg-main)]/80 backdrop-blur-md cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-surface)] w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden cursor-default relative border border-[var(--border-color)]"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <div className="flex gap-2 mb-3">
                                            <PriorityBadge priority={selectedTask.priority} />
                                            <StatusBadge status={selectedTask.status} />
                                        </div>
                                        <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase">
                                            {selectedTask.title}
                                        </h3>
                                    </div>
                                    <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-[var(--bg-main)] rounded-[24px] border border-[var(--border-color)]">
                                        <p className="text-[var(--text-muted)] font-medium leading-relaxed opacity-80">
                                            {selectedTask.description || "Açıklama belirtilmemiş."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-[var(--bg-main)] rounded-[20px] flex items-center gap-4 border border-[var(--border-color)]">
                                            <div className="w-10 h-10 bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center shadow-sm border border-[var(--border-color)]">
                                                <Clock className="w-5 h-5 text-[var(--text-muted)] opacity-60" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Başlangıç</p>
                                                <p className="text-xs font-bold text-[var(--text-main)]">
                                                    {selectedTask.startDate ? new Date(selectedTask.startDate).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[var(--bg-main)] rounded-[20px] flex items-center gap-4 border border-[var(--border-color)]">
                                            <div className="w-10 h-10 bg-[var(--bg-surface)] rounded-[14px] flex items-center justify-center shadow-sm border border-[var(--border-color)]">
                                                <CalendarIcon className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Bitiş</p>
                                                <p className="text-xs font-bold text-[var(--text-main)]">
                                                    {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-[var(--bg-main)] rounded-[20px] border border-[var(--border-color)]">
                                        <div className="w-12 h-12 rounded-[16px] bg-[var(--bg-surface)] border-4 border-[var(--bg-surface)] shadow-sm flex items-center justify-center font-black text-primary-500 overflow-hidden shrink-0">
                                            {selectedTask.assignedUser?.avatarUrl ? (
                                                <img src={getAvatarUrl(selectedTask.assignedUser.avatarUrl)} className="w-full h-full object-cover" />
                                            ) : (
                                                selectedTask.assignedUser?.username?.[0] || '?'
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Atanan Kullanıcı</p>
                                            <p className="text-sm font-bold text-[var(--text-main)]">{selectedTask.assignedUser?.username || "Atanmamış"}</p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredTask && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            position: 'fixed',
                            left: tooltipPos.x + 20,
                            top: tooltipPos.y - 40,
                            pointerEvents: 'none',
                            zIndex: 300
                        }}
                        className="bg-[var(--bg-surface)] backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-[var(--border-color)] min-w-[280px] shadow-primary-500/10"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <PriorityBadge priority={hoveredTask.priority} />
                            <StatusBadge status={hoveredTask.status} />
                        </div>
                        <h4 className="text-base font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">{hoveredTask.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] font-medium mb-5 line-clamp-3 italic leading-relaxed opacity-80">
                            {hoveredTask.description || 'Açıklama belirtilmemiş.'}
                        </p>
                        <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-color)]">
                            <div className="w-10 h-10 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[13px] font-black text-primary-400 border border-[var(--border-color)] shadow-sm overflow-hidden shrink-0">
                                {hoveredTask.assignedUser?.avatarUrl ? (
                                    <img src={getAvatarUrl(hoveredTask.assignedUser.avatarUrl)} className="w-full h-full object-cover" />
                                ) : (
                                    hoveredTask.assignedUser?.username?.[0] || '?'
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[11px] font-black text-[var(--text-main)] truncate uppercase tracking-tight">
                                    {hoveredTask.assignedUser?.username || 'Atanmamış'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarPage;
