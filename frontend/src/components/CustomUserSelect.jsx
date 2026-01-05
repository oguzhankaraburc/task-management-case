import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import getAvatarUrl from '../utils/avatarHelper';

const CustomUserSelect = ({ users, selectedUserId, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedUser = users.find(u => u.id === parseInt(selectedUserId));

    return (
        <div className="relative group/field">
            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[60px] px-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] flex items-center justify-between active:scale-[0.99] border border-[var(--border-color)]"
            >
                <div className="flex items-center gap-3">
                    {selectedUser ? (
                        <>
                            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-[10px] text-white font-black overflow-hidden shadow-sm">
                                {selectedUser.avatarUrl ? (
                                    <img src={getAvatarUrl(selectedUser.avatarUrl)} alt={selectedUser.username} className="w-full h-full object-cover" />
                                ) : (
                                    selectedUser.username[0].toUpperCase()
                                )}
                            </div>
                            <span>{selectedUser.username}</span>
                        </>
                    ) : (
                        <span className="text-[var(--text-muted)] opacity-30">Seçiniz...</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform opacity-50 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 4 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 z-[120] mt-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden p-2 will-change-transform"
                        >
                            <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-1">
                                {users.map((u) => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onClick={() => {
                                            onSelect(u.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] transition-all ${parseInt(selectedUserId) === u.id
                                            ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black overflow-hidden ${parseInt(selectedUserId) === u.id ? 'bg-[var(--bg-surface)] shadow-sm' : 'bg-[var(--bg-main)] border border-[var(--border-color)]'}`}>
                                                {u.avatarUrl ? (
                                                    <img src={getAvatarUrl(u.avatarUrl)} alt={u.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    u.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="text-left font-bold text-sm tracking-tight">{u.username}</div>
                                        </div>
                                        {parseInt(selectedUserId) === u.id && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomUserSelect;
