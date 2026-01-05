import React, { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Clock, AlertCircle, Layout, Activity } from 'lucide-react';
import statsService from '../services/stats.service';
import { useAuth } from '../context/AuthContext';
import socketService from '../services/socket.service';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            try {
                const data = await statsService.getStats();
                if (mounted) {
                    setStats(data);
                    setTimeout(() => {
                        if (mounted) setIsReady(true);
                    }, 800);
                }
            } catch (error) {
                console.error('Stats fetch error:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchStats();

        socketService.onStatsUpdate(() => {
            fetchStats();
        });

        return () => { mounted = false; };
    }, []);

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    const title = user?.role === 'Admin' ? 'SİSTEM ÖZETİ' : 'PERFORMANSIM';

    const COLORS = ['#8884d8', '#ffc658', '#42f59e', '#ff4d4d'];
    const DARK_BG = '#112031';
    const LIGHT_TEXT = '#D4ECDD';

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">{title}</h2>
                <p className="text-[var(--text-muted)] text-[11px] font-medium opacity-60 max-w-lg leading-relaxed tracking-wide mt-1 italic">
                    {user?.role === 'Admin'
                        ? 'Tüm sistem verilerini, proje ilerlemelerini ve ekip performansını buradan analiz edin.'
                        : 'Dahil olduğunuz projelerdeki ilerlemenizi ve görev dağılımınızı takip edin.'}
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'TOPLAM PROJE', value: stats?.summary.totalProjects, icon: Layout, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'TOPLAM GÖREV', value: stats?.summary.totalTasks, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                    { label: 'TAMAMLANAN', value: stats?.summary.completedTasks, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'GECİKMİŞ', value: stats?.summary.overdueTasks, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
                ].map((item, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={item.label}
                        className="bg-[var(--bg-surface)] p-6 rounded-[32px] border border-[var(--border-color)] shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${item.bg}`}>
                                <item.icon className={`w-6 h-6 ${item.color}`} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 leading-none mb-1">{item.label}</p>
                                <p className="text-2xl font-black text-[var(--text-main)] leading-none">{item.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pie Chart: Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[var(--bg-surface)] p-8 rounded-[40px] border border-[var(--border-color)] shadow-lg min-h-[450px]"
                >
                    <h3 className="font-black text-[var(--text-main)] uppercase tracking-tight mb-8 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        GÖREV DURUM DAĞILIMI
                    </h3>
                    <div className="h-[300px] w-full relative mt-4 overflow-hidden grid place-items-center" style={{ minWidth: 0 }}>
                        {(isReady && stats?.statusDistribution) ? (
                            <ResponsiveContainer width="99%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {stats.statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: DARK_BG,
                                            borderColor: '#333',
                                            borderRadius: '16px',
                                            color: LIGHT_TEXT,
                                            fontSize: '12px'
                                        }}
                                        itemStyle={{ color: LIGHT_TEXT }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm opacity-50">Veri bulunamadı</div>
                        )}
                    </div>
                </motion.div>

                {/* Bar Chart: Project Progress */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[var(--bg-surface)] p-8 rounded-[40px] border border-[var(--border-color)] shadow-lg min-h-[450px]"
                >
                    <h3 className="font-black text-[var(--text-main)] uppercase tracking-tight mb-8 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-amber-500" />
                        PROJE İLERLEME (%)
                    </h3>
                    <div className="h-[300px] w-full relative mt-4 overflow-hidden grid place-items-center" style={{ minWidth: 0 }}>
                        {(isReady && stats?.projectProgress) ? (
                            <ResponsiveContainer width="99%" height="100%">
                                <BarChart data={stats.projectProgress}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
                                        domain={[0, 100]}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{
                                            backgroundColor: DARK_BG,
                                            borderColor: '#333',
                                            borderRadius: '16px',
                                            color: LIGHT_TEXT,
                                            fontSize: '12px'
                                        }}
                                    />
                                    <Bar
                                        dataKey="progress"
                                        fill="#8884d8"
                                        radius={[10, 10, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-sm opacity-50">Veri bulunamadı</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Analytics;
