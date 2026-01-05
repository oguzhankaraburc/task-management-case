import React from 'react';

const PriorityBadge = ({ priority }) => {
    const styles = {
        'High': 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
        'Medium': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        'Low': 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
    };
    return (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border tracking-tighter ${styles[priority] || styles['Low']}`}>
            {priority}
        </span>
    );
};

export default PriorityBadge;
