import React from 'react';
import { motion } from 'framer-motion';
import getAvatarUrl from '../utils/avatarHelper';

const AvatarGroup = ({ users = [], max = 3 }) => {

    const uniqueUsers = Array.from(new Map(users.map(u => [u.id, u])).values());
    const displayUsers = uniqueUsers.slice(0, max);
    const extraCount = uniqueUsers.length > max ? uniqueUsers.length - max : 0;

    return (
        <div className="flex items-center -space-x-3">
            {displayUsers.map((user, index) => (
                <div
                    key={user.id}
                    className="relative group/avatar"
                    style={{ zIndex: displayUsers.length - index }}
                >
                    <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm transition-transform hover:scale-110 cursor-pointer">
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                            {user.avatarUrl ? (
                                <img src={getAvatarUrl(user.avatarUrl)} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.username.slice(0, 2)}</span>
                            )}
                        </div>
                    </div>

                    {/* Minimal Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-[10px] opacity-0 group-hover/avatar:opacity-100 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-2xl scale-90 group-hover/avatar:scale-100 origin-bottom">
                        {user.username}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[5px] border-transparent border-t-slate-900" />
                    </div>
                </div>
            ))}

            {extraCount > 0 && (
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm z-0">
                    <div className="w-full h-full rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 text-[10px] font-black text-slate-400">
                        +{extraCount}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarGroup;
