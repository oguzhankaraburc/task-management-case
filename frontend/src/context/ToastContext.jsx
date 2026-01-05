import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-10 right-10 z-[300] space-y-4 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.8 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                flex items-center gap-4 px-6 py-4 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-md
                                ${toast.type === 'error'
                                    ? 'bg-red-50/90 border-red-100 text-red-600'
                                    : 'bg-emerald-50/90 border-emerald-100 text-emerald-600'}
                            `}>
                                <div className={`p-2 rounded-xl ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                    {toast.type === 'error'
                                        ? <AlertCircle className="w-5 h-5 text-white" />
                                        : <CheckCircle className="w-5 h-5 text-white" />
                                    }
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                        {toast.type === 'error' ? 'Hata' : 'Başarılı'}
                                    </span>
                                    <span className="text-sm font-bold tracking-tight">{toast.message}</span>
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="ml-4 p-1 hover:bg-black/5 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 opacity-40" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
