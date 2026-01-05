import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        'Todo': 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-500/10 dark:text-primary-400 dark:border-primary-500/20',
        'In Progress': 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        'Done': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        'Overdue': 'bg-red-50 text-red-600 border-red-100 animate-pulse-slow dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
    };
    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${styles[status]}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
