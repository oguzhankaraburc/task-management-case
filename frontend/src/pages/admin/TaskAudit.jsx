import React, { useEffect, useState } from 'react';
import taskService from '../../services/task.service';
import authService from '../../services/auth.service';
import projectService from '../../services/project.service';
import {
    CheckSquare,
    Search,
    Loader2,
    Edit3,
    Clock,
    Calendar,
    X,
    Briefcase,
    Flag,
    Layers,
    Hash
} from 'lucide-react';
import CustomDropdown from '../../components/CustomDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import getAvatarUrl from '../../utils/avatarHelper';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import CustomUserSelect from '../../components/CustomUserSelect';
import CustomDatePicker from '../../components/CustomDatePicker';

const TaskAudit = () => {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskSearch, setTaskSearch] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const { showToast } = useToast();

    const [showTaskEditModal, setShowTaskEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const fetchData = async (tSearch = '', silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setIsSearching(true);

            const [t, u, p] = await Promise.all([
                taskService.getAllTasks(tSearch),
                authService.getAllUsers(),
                projectService.getProjects()
            ]);
            setTasks(t);
            setUsers(u);
            setProjects(p);
        } catch (err) {
            showToast('Görevler yüklenemedi.', 'error');
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(taskSearch, true);
        }, 300);
        return () => clearTimeout(timer);
    }, [taskSearch]);

    const handleUpdateTask = async (e) => {
        e.preventDefault();

        if (editingTask.startDate && editingTask.dueDate && new Date(editingTask.dueDate) < new Date(editingTask.startDate)) {
            return showToast('Bitiş tarihi başlangıç tarihinden önce olamaz.', 'error');
        }

        try {
            await taskService.updateTask(editingTask.id, {
                title: editingTask.title,
                description: editingTask.description,
                status: editingTask.status,
                priority: editingTask.priority,
                assignedUserId: editingTask.assignedUserId,
                startDate: editingTask.startDate,
                dueDate: editingTask.dueDate
            });
            showToast('Görev başarıyla güncellendi!', 'success');
            setShowTaskEditModal(false);
            setEditingTask(null);
            fetchData(taskSearch);
        } catch (err) {
            showToast('Güncelleme başarısız.', 'error');
        }
    };

    if (loading) return (
        <div className="flex bg-[var(--bg-main)] min-h-[400px] items-center justify-center w-full">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );

    return (
        <div className="w-full">
            <header className="mb-10">
                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">GÖREV DENETİMİ</h2>
                <p className="text-[var(--text-muted)] font-bold mt-2 text-sm opacity-60">Sistem genelindeki tüm görevleri izleyin, durumlarını ve atamalarını denetleyin.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 w-full"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                    <h3 className="font-black text-[var(--text-main)] uppercase tracking-tight">SİSTEM GENELİ GÖREVLER</h3>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-50" />
                            <input
                                type="text"
                                placeholder="Görevlerde ara..."
                                value={taskSearch}
                                onChange={(e) => setTaskSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-main)] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/30 focus:shadow-sm transition-all placeholder:text-[var(--text-muted)]/30"
                            />
                            {isSearching && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-3.5 h-3.5 text-primary-500 animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="bg-[var(--bg-surface)] px-4 py-2 rounded-xl border border-[var(--border-color)] text-[11px] font-black text-[var(--text-muted)] uppercase whitespace-nowrap opacity-70">{tasks.length} GÖREV</div>
                    </div>
                </div>

                {tasks.length === 0 ? (
                    <div className="bg-[var(--bg-surface)] rounded-[40px] p-20 text-center border-2 border-dashed border-[var(--border-color)]">
                        <CheckSquare className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-20" />
                        <p className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-sm opacity-50">Henüz sistemde görev bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(t => (
                            <motion.div
                                key={t.id}
                                layout
                                className="bg-[var(--bg-surface)] p-6 rounded-[32px] border border-[var(--border-color)] shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1.5 text-left">
                                        <div className="flex items-center gap-2">
                                            <PriorityBadge priority={t.priority} />
                                            <span className="text-[10px] font-black text-primary-500 bg-primary-50 dark:bg-primary-500/10 px-2 py-0.5 rounded-md uppercase tracking-tighter border border-primary-100 dark:border-primary-500/20">
                                                {t.project?.name}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-[var(--text-main)] leading-tight group-hover:text-primary-600 transition-colors uppercase tracking-tight mt-1">{t.title}</h4>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                const normalizedTask = {
                                                    ...t,
                                                    startDate: t.startDate ? t.startDate.split('T')[0] : null,
                                                    dueDate: t.dueDate ? t.dueDate.split('T')[0] : null
                                                };
                                                setEditingTask(normalizedTask);
                                                setShowTaskEditModal(true);
                                            }}
                                            className="p-2 text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                                            title="Düzenle"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <StatusBadge status={t.status} />
                                    </div>
                                </div>

                                <p className="text-[var(--text-muted)] text-xs font-medium line-clamp-2 mb-6 min-h-[32px] text-left opacity-80">
                                    {t.description || "Açıklama belirtilmemiş."}
                                </p>

                                {(t.startDate || t.dueDate) && (
                                    <div className="flex items-center gap-3 mb-5 p-2.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
                                        {t.startDate && (
                                            <div className="flex flex-col flex-1">
                                                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1 text-left opacity-60">Başlangıç</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-main)]">
                                                    <Clock className="w-3 h-3 text-primary-500" />
                                                    {new Date(t.startDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                        {t.dueDate && (
                                            <div className={`flex flex-col flex-1 ${t.startDate ? 'border-l border-[var(--border-color)] pl-3' : ''}`}>
                                                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1 text-left opacity-60">Bitiş</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-main)]">
                                                    <Calendar className="w-3 h-3 text-red-400" />
                                                    {new Date(t.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-5 border-t border-[var(--border-color)] mt-auto">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-9 h-9 bg-[var(--bg-main)] rounded-xl flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] border border-[var(--border-color)] shadow-sm overflow-hidden">
                                            {t.assignedUser?.avatarUrl ? (
                                                <img src={getAvatarUrl(t.assignedUser.avatarUrl)} alt={t.assignedUser?.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-primary-500">{t.assignedUser?.username?.[0].toUpperCase() || '?'}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1 opacity-50">ATANAN</span>
                                            <span className="text-xs font-bold text-[var(--text-main)] leading-none">{t.assignedUser?.username || 'Atanmamış'}</span>
                                        </div>
                                    </div>
                                    {!t.startDate && !t.dueDate && (
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none block mb-1 opacity-50">TARİH</span>
                                            <span className="text-[11px] font-bold text-[var(--text-muted)]">{new Date(t.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showTaskEditModal && editingTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTaskEditModal(false)}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--bg-main)]/80 backdrop-blur-md cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-surface)] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden cursor-default relative border border-[var(--border-color)]"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="text-left">
                                        <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">Görev Detayları</h3>
                                        <p className="text-[var(--text-muted)] font-bold text-xs mt-1 uppercase tracking-widest text-primary-500 opacity-60">Görev bilgilerini ve durumunu güncelleyin</p>
                                    </div>
                                    <button onClick={() => setShowTaskEditModal(false)} className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-colors">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateTask}>
                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                        <div className="space-y-6 px-1 pb-1">
                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 text-left opacity-60">GÖREV BAŞLIĞI</label>
                                                <input
                                                    className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] transition-all"
                                                    value={editingTask.title}
                                                    onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <CustomDropdown
                                                    label="DURUM"
                                                    icon={Layers}
                                                    options={[
                                                        { id: 'Todo', label: 'Todo', dot: 'bg-primary-500' },
                                                        { id: 'In Progress', label: 'In Progress', dot: 'bg-amber-500' },
                                                        { id: 'Done', label: 'Done', dot: 'bg-emerald-500' },
                                                        { id: 'Overdue', label: 'Overdue', dot: 'bg-red-500' }
                                                    ]}
                                                    value={editingTask.status}
                                                    onChange={(val) => setEditingTask({ ...editingTask, status: val })}
                                                />
                                                <CustomDropdown
                                                    label="ÖNCELİK SEVİYESİ"
                                                    icon={Flag}
                                                    options={[
                                                        { id: 'Low', label: 'Düşük', dot: 'bg-emerald-400' },
                                                        { id: 'Medium', label: 'Orta', dot: 'bg-amber-400' },
                                                        { id: 'High', label: 'Yüksek', dot: 'bg-red-400' }
                                                    ]}
                                                    value={editingTask.priority}
                                                    onChange={(val) => setEditingTask({ ...editingTask, priority: val })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <div className="col-span-2">
                                                    <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2.5 uppercase tracking-widest px-1 opacity-60">GÖREVE ATANAN</label>
                                                    <CustomUserSelect
                                                        users={users}
                                                        selectedUserId={editingTask.assignedUserId}
                                                        onSelect={(val) => setEditingTask({ ...editingTask, assignedUserId: val })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-5">
                                                <CustomDatePicker
                                                    label="BAŞLANGIÇ TARİHİ"
                                                    selectedDate={editingTask.startDate}
                                                    onSelect={(val) => setEditingTask({ ...editingTask, startDate: val })}
                                                />
                                                <CustomDatePicker
                                                    label="BİTİŞ TARİHİ"
                                                    selectedDate={editingTask.dueDate}
                                                    onSelect={(val) => setEditingTask({ ...editingTask, dueDate: val })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 text-left opacity-60">GÖREV AÇIKLAMASI</label>
                                                <textarea
                                                    className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] min-h-[100px] resize-none"
                                                    placeholder="Görev açıklaması..."
                                                    value={editingTask.description || ''}
                                                    onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-8 border-t border-[var(--border-color)] mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowTaskEditModal(false)}
                                            className="flex-1 py-5 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-[20px] font-black transition-all uppercase tracking-widest text-[13px] border border-[var(--border-color)]/30"
                                        >
                                            İPTAL
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-[2] py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] font-black shadow-xl shadow-primary-500/20 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-widest text-[13px]"
                                        >
                                            GÜNCELLEMEYİ KAYDET
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskAudit;
