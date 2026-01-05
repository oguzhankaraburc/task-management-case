import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDropdown = ({ options, value, onChange, label, icon: Icon, placeholder = "Seçiniz", zIndex = 70 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selected = options.find(opt => opt.id.toString() === value?.toString());

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

    return (
        <div className="relative group/field w-full" ref={containerRef}>
            {label && <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2.5 uppercase tracking-widest px-1 opacity-60">{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[64px] px-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] flex items-center justify-between active:scale-[0.99] border border-[var(--border-color)]"
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-4 h-4 text-[var(--text-muted)] opacity-50" />}
                    <span className={!selected ? "text-[var(--text-muted)] opacity-30" : ""}>
                        {selected ? selected.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform opacity-50 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 4 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-2 will-change-transform overflow-hidden"
                        style={{ zIndex: zIndex + 10 }}
                    >
                        <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-1">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[14px] transition-all ${value?.toString() === opt.id.toString()
                                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600'
                                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {opt.dot && <div className={`w-2 h-2 rounded-full ${opt.dot} shadow-sm`} />}
                                        <span className="font-bold text-sm tracking-tight">{opt.label}</span>
                                    </div>
                                    {value?.toString() === opt.id.toString() && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;
