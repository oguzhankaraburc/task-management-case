import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDatePicker = ({ selectedDate, onSelect, placeholder = "gg.aa.yyyy", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (selectedDate && !isNaN(new Date(selectedDate).getTime())) {
            return new Date(selectedDate);
        }
        return new Date();
    });
    const [align, setAlign] = useState('left');
    const containerRef = useRef(null);

    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ];

    const days = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (selectedDate && !isNaN(new Date(selectedDate).getTime())) {
            setViewDate(new Date(selectedDate));
        }
    }, [selectedDate]);

    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceOnRight = window.innerWidth - rect.right;
            if (spaceOnRight < 250) {
                setAlign('right');
            } else {
                setAlign('left');
            }
        }
    }, [isOpen]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1;
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        onSelect(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        const d = new Date(selectedDate);
        return d.getDate() === day &&
            d.getMonth() === viewDate.getMonth() &&
            d.getFullYear() === viewDate.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        const parts = cleanDate.split('-');
        if (parts.length !== 3) return dateStr;
        const [year, month, day] = parts;
        return `${day}.${month}.${year}`;
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
        const totalSlots = Math.ceil((daysInMonth + firstDay) / 7) * 7;
        const calendarDays = [];

        const prevMonthDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
        const daysInPrevMonth = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
        for (let i = firstDay - 1; i >= 0; i--) {
            calendarDays.push({ day: daysInPrevMonth - i, type: 'prev' });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push({ day: i, type: 'current' });
        }

        const remainingSlots = totalSlots - calendarDays.length;
        for (let i = 1; i <= remainingSlots; i++) {
            calendarDays.push({ day: i, type: 'next' });
        }

        return (
            <div className="grid grid-cols-7 gap-0.5">
                {days.map(d => (
                    <div key={d} className="text-center text-[9px] font-black text-[var(--text-muted)] uppercase py-1.5 opacity-40">
                        {d}
                    </div>
                ))}
                {calendarDays.map((dateObj, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => dateObj.type === 'current' && handleDateClick(dateObj.day)}
                        disabled={dateObj.type !== 'current'}
                        className={`
                            h-8 w-full rounded-lg text-[11px] font-bold transition-all relative flex items-center justify-center
                            ${dateObj.type === 'current'
                                ? isSelected(dateObj.day)
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20 z-10'
                                    : 'text-[var(--text-main)] hover:bg-[var(--bg-main)]'
                                : 'text-[var(--text-muted)] opacity-20'
                            }
                        `}
                    >
                        {dateObj.day}
                        {dateObj.type === 'current' && isToday(dateObj.day) && !isSelected(dateObj.day) && (
                            <div className="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-black text-[var(--text-muted)] mb-1.5 uppercase tracking-widest px-1 opacity-60">
                    {label}
                </label>
            )}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-10 pr-4 py-3 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] 
                    cursor-pointer transition-all flex items-center relative group border border-[var(--border-color)]
                    ${isOpen ? 'bg-[var(--bg-surface)] border-primary-500/20 shadow-sm' : 'hover:bg-[var(--bg-surface)]'}
                `}
            >
                <CalendarIcon className={`absolute left-3.5 w-3.5 h-3.5 transition-colors ${selectedDate ? 'text-primary-500' : 'text-[var(--text-muted)] opacity-30'}`} />
                <span className={`text-[13px] font-bold ${selectedDate ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)] opacity-30'}`}>
                    {selectedDate ? formatDate(selectedDate) : placeholder}
                </span>
                {selectedDate && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(null);
                        }}
                        className="absolute right-3.5 text-[var(--text-muted)] hover:text-red-500 transition-colors opacity-50 hover:opacity-100"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        className={`absolute top-full z-[150] mt-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-4 min-w-[260px] ${align === 'right' ? 'right-0' : 'left-0'}`}
                    >
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h4 className="font-black text-[var(--text-main)] text-[12px] uppercase tracking-tight">
                                {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </h4>
                            <div className="flex gap-0.5">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="p-1 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all opacity-50 hover:opacity-100"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="p-1 hover:bg-[var(--bg-main)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all opacity-50 hover:opacity-100"
                                >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {renderCalendar()}

                        <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex justify-between items-center px-1">
                            <button
                                type="button"
                                onClick={() => onSelect(null)}
                                className="text-[9px] font-black text-[var(--text-muted)] hover:text-red-500 uppercase tracking-widest transition-colors opacity-50 hover:opacity-100"
                            >
                                Temizle
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    const y = today.getFullYear();
                                    const m = String(today.getMonth() + 1).padStart(2, '0');
                                    const d = String(today.getDate()).padStart(2, '0');
                                    onSelect(`${y}-${m}-${d}`);
                                    setIsOpen(false);
                                }}
                                className="text-[9px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest transition-colors"
                            >
                                Bugün
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDatePicker;
