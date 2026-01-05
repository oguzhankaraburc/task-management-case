import React, { useEffect, useState } from 'react';
import projectService from '../../services/project.service';
import authService from '../../services/auth.service';
import {
    Briefcase,
    Trash2,
    Edit3,
    Calendar,
    UserPlus,
    Plus,
    X,
    Loader2,
    Search,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import getAvatarUrl from '../../utils/avatarHelper';
import CustomUserSelect from '../../components/CustomUserSelect';
import CustomDatePicker from '../../components/CustomDatePicker';
import AvatarGroup from '../../components/AvatarGroup';

const ProjectCenter = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [projectOwnerId, setProjectOwnerId] = useState('');
    const [projectStartDate, setProjectStartDate] = useState('');
    const [projectEndDate, setProjectEndDate] = useState('');

    const [showProjectEditModal, setShowProjectEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [showProjectDeleteModal, setShowProjectDeleteModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [selectedProjectForMember, setSelectedProjectForMember] = useState(null);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [p, u] = await Promise.all([
                projectService.getProjects(),
                authService.getAllUsers()
            ]);
            setProjects(p);
            setUsers(u);
            if (u.length > 0 && !projectOwnerId) setProjectOwnerId(u[0].id);
        } catch (err) {
            showToast('Projeler yüklenemedi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await projectService.createProject(projectName, projectDesc, projectOwnerId, projectStartDate, projectEndDate);
            showToast('Proje başarıyla oluşturuldu!', 'success');
            setProjectName('');
            setProjectDesc('');
            setProjectStartDate('');
            setProjectEndDate('');
            fetchData();
        } catch (err) {
            showToast('Proje oluşturulamadı.', 'error');
        }
    };

    const handleUpdateProject = async (e) => {
        e.preventDefault();
        try {
            await projectService.updateProject(editingProject.id, {
                name: editingProject.name,
                description: editingProject.description,
                ownerId: editingProject.ownerId,
                startDate: editingProject.startDate,
                endDate: editingProject.endDate
            });
            showToast('Proje başarıyla güncellendi!', 'success');
            setShowProjectEditModal(false);
            setEditingProject(null);
            fetchData();
        } catch (err) {
            showToast('Güncelleme başarısız.', 'error');
        }
    };

    const handleDeleteProject = (project) => {
        setProjectToDelete(project);
        setShowProjectDeleteModal(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await projectService.deleteProject(projectToDelete.id);
            showToast('Proje başarıyla silindi.', 'success');
            fetchData();
            setShowProjectDeleteModal(false);
            setProjectToDelete(null);
        } catch (err) {
            showToast('Proje silinemedi.', 'error');
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await projectService.addMember(selectedProjectForMember.id, userId);
            const updatedProjects = await projectService.getProjects();
            setProjects(updatedProjects);
            setSelectedProjectForMember(updatedProjects.find(p => p.id === selectedProjectForMember.id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveMember = async (projectId, userId) => {
        try {
            await projectService.removeMember(projectId, userId);
            const updatedProjects = await projectService.getProjects();
            setProjects(updatedProjects);
            setSelectedProjectForMember(updatedProjects.find(p => p.id === selectedProjectForMember.id));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredProjects = projects.filter(p => {
        const searchLower = searchTerm.toLowerCase();
        return (
            p.name.toLowerCase().includes(searchLower) ||
            (p.description && p.description.toLowerCase().includes(searchLower)) ||
            (p.owner?.username?.toLowerCase().includes(searchLower))
        );
    });

    if (loading) return (
        <div className="flex bg-[var(--bg-main)] min-h-[400px] items-center justify-center w-full">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
        </div>
    );

    return (
        <div className="w-full">
            <header className="mb-10">
                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">PROJE MERKEZİ</h2>
                <p className="text-[var(--text-muted)] font-bold mt-2 text-sm opacity-60">Sistemdeki tüm aktif projeleri buradan yönetin, üye ekleyin veya yeni projeler başlatın.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 2xl:grid-cols-3 gap-8 w-full items-start"
            >
                <div className="2xl:col-span-2 space-y-6">
                    {/* Toolbar: Search and View Toggle */}
                    <div className="flex flex-wrap items-center justify-between gap-6 bg-[var(--bg-surface)] p-5 rounded-[30px] border border-[var(--border-color)]">
                        <div className="relative flex-1 min-w-[300px] group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-60" />
                            <input
                                type="text"
                                placeholder="Proje adı, açıklama veya sahip ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-[var(--bg-main)] border-2 border-transparent rounded-[18px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50 text-sm"
                            />
                        </div>

                        <div className="flex items-center gap-2 bg-[var(--bg-main)] p-1 rounded-[18px] border border-[var(--border-color)]">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'grid'
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                                title="Kart Görünümü"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-[14px] transition-all ${viewMode === 'list'
                                    ? 'bg-primary-600 text-white shadow-lg'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
                                title="Liste Görünümü"
                            >
                                <ListIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto pr-4 custom-scrollbar">
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 content-start pb-10">
                                {filteredProjects.map(p => (
                                    <div key={p.id} className="bg-[var(--bg-surface)] p-6 rounded-[35px] border border-[var(--border-color)] shadow-[0_15px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group hover:shadow-[0_25px_50px_rgba(0,0,0,0.04)] transition-all duration-500 flex flex-col h-full min-h-[360px]">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-600 group-hover:w-1.5 transition-all" />
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight line-clamp-1">{p.name}</h4>
                                            <div className="flex items-center gap-0.5">
                                                <button
                                                    onClick={() => {
                                                        setEditingProject({ ...p });
                                                        setShowProjectEditModal(true);
                                                    }}
                                                    className="p-1.5 text-[var(--text-muted)] hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-all"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteProject(p)} className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-[var(--text-muted)] text-[11px] font-medium mb-4 line-clamp-2 opacity-80 leading-relaxed">{p.description}</p>

                                        {(p.startDate || p.endDate) && (
                                            <div className="flex flex-col gap-2 mb-6 p-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)]">
                                                {p.startDate && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">BAŞLADI</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-main)]">
                                                            <Calendar className="w-3 h-3 text-primary-500" />
                                                            {new Date(p.startDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                                {p.endDate && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-50">BİTECEK</span>
                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-main)]">
                                                            <Calendar className="w-3 h-3 text-red-400" />
                                                            {new Date(p.endDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto space-y-4 pt-4 border-t border-[var(--border-color)]">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 bg-[var(--bg-main)] rounded-[10px] flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] border border-[var(--border-color)] shadow-sm overflow-hidden">
                                                    {p.owner?.avatarUrl ? (
                                                        <img src={getAvatarUrl(p.owner.avatarUrl)} alt={p.owner.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        p.owner?.username[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-0.5 opacity-50">SAHİBİ</span>
                                                    <span className="text-[11px] font-bold text-[var(--text-main)] leading-none">{p.owner?.username}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <AvatarGroup users={p.members || []} />
                                                <button
                                                    onClick={() => {
                                                        setSelectedProjectForMember(p);
                                                        setShowMemberModal(true);
                                                    }}
                                                    className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-all group/add"
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[var(--bg-surface)] rounded-[35px] border border-[var(--border-color)] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-[var(--bg-main)]/50">
                                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Proje Adı</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Sahibi</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Tarih Aralığı</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Üyeler</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 text-right">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border-color)]/30">
                                            {filteredProjects.map(p => (
                                                <tr key={p.id} className="hover:bg-[var(--bg-main)]/50 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[var(--text-main)] text-sm mb-1">{p.name}</span>
                                                            <span className="text-[11px] text-[var(--text-muted)] opacity-60 truncate max-w-[200px]">{p.description}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[var(--bg-main)] rounded-lg flex items-center justify-center overflow-hidden border border-[var(--border-color)]">
                                                                {p.owner?.avatarUrl ? <img src={getAvatarUrl(p.owner.avatarUrl)} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-primary-500">{p.owner?.username[0]}</span>}
                                                            </div>
                                                            <span className="text-xs font-bold text-[var(--text-main)]">{p.owner?.username}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
                                                            <Calendar className="w-3.5 h-3.5 text-primary-500 opacity-60" />
                                                            {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'} - {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2">
                                                            <AvatarGroup users={p.members || []} />
                                                            <button
                                                                onClick={() => { setSelectedProjectForMember(p); setShowMemberModal(true); }}
                                                                className="w-7 h-7 rounded-full border border-dashed border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] p-1 hover:text-primary-500 hover:border-primary-500 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => { setEditingProject({ ...p }); setShowProjectEditModal(true); }} className="p-2 text-[var(--text-muted)] hover:text-primary-500 transition-colors"><Edit3 className="w-4 h-4" /></button>
                                                            <button onClick={() => handleDeleteProject(p)} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--bg-surface)] p-10 rounded-[40px] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                        <h3 className="text-xl font-black text-[var(--text-main)] mb-6 uppercase tracking-tight">Yeni Proje Oluştur</h3>
                        <form onSubmit={handleCreateProject} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">PROJE ADI</label>
                                <input
                                    className="w-full p-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                    placeholder="Proje ismini girin..."
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">AÇIKLAMA</label>
                                <textarea
                                    className="w-full p-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all font-bold text-[var(--text-main)] min-h-[100px] resize-none placeholder:text-[var(--text-muted)]/50"
                                    placeholder="Proje detaylarını yazın..."
                                    value={projectDesc}
                                    onChange={e => setProjectDesc(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <CustomDatePicker
                                    label="BAŞLANGIÇ"
                                    selectedDate={projectStartDate}
                                    onSelect={setProjectStartDate}
                                />
                                <CustomDatePicker
                                    label="BİTİŞ"
                                    selectedDate={projectEndDate}
                                    onSelect={setProjectEndDate}
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">PROJE SAHİBİ</label>
                                <CustomUserSelect
                                    users={users}
                                    selectedUserId={projectOwnerId}
                                    onSelect={setProjectOwnerId}
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[16px] font-black shadow-lg shadow-primary-500/20 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]">
                                PROJEYİ OLUŞTUR
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Edit Project Modal */}
            <AnimatePresence>
                {showProjectEditModal && editingProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowProjectEditModal(false)}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer"
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
                                    <div>
                                        <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">PROJEYİ DÜZENLE</h3>
                                        <p className="text-[var(--text-muted)] font-bold text-xs mt-1 uppercase tracking-widest text-primary-500">Proje detaylarını güncelle</p>
                                    </div>
                                    <button onClick={() => setShowProjectEditModal(false)} className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-colors">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateProject}>
                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                        <div>
                                            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">PROJE ADİ</label>
                                            <input
                                                className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)]"
                                                placeholder="Proje ismini girin..."
                                                value={editingProject.name}
                                                onChange={e => setEditingProject({ ...editingProject, name: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">AÇIKLAMA</label>
                                            <textarea
                                                className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] min-h-[120px] resize-none"
                                                placeholder="Proje detaylarını yazın..."
                                                value={editingProject.description || ''}
                                                onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <CustomDatePicker
                                                label="BAŞLANGIÇ"
                                                selectedDate={editingProject.startDate}
                                                onSelect={(date) => setEditingProject({ ...editingProject, startDate: date })}
                                            />
                                            <CustomDatePicker
                                                label="BİTİŞ"
                                                selectedDate={editingProject.endDate}
                                                onSelect={(date) => setEditingProject({ ...editingProject, endDate: date })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">PROJE SAHİBİ</label>
                                            <CustomUserSelect
                                                users={users}
                                                selectedUserId={editingProject.ownerId}
                                                onSelect={(val) => setEditingProject({ ...editingProject, ownerId: val })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-8 border-t border-[var(--border-color)] mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowProjectEditModal(false)}
                                            className="flex-1 py-5 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-[20px] font-black transition-all uppercase tracking-widest text-[13px]"
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

            {/* Project Delete Modal */}
            <AnimatePresence>
                {showProjectDeleteModal && projectToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[var(--bg-main)]/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[var(--bg-surface)] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-10 text-center border border-[var(--border-color)]"
                        >
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">PROJEYİ SİL</h3>
                            <p className="text-[var(--text-muted)] font-medium mb-8 opacity-80">
                                <span className="font-black text-[var(--text-main)]">{projectToDelete.name}</span> projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowProjectDeleteModal(false)}
                                    className="flex-1 py-4 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-[20px] font-black transition-all uppercase tracking-widest text-[12px]"
                                >
                                    İPTAL
                                </button>
                                <button
                                    onClick={confirmDeleteProject}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-[20px] font-black shadow-lg shadow-red-200 transition-all uppercase tracking-widest text-[12px]"
                                >
                                    EVET, SİL
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Member Management Modal */}
            <AnimatePresence>
                {showMemberModal && selectedProjectForMember && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowMemberModal(false)}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--bg-main)]/80 backdrop-blur-md cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-surface)] w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden cursor-default relative border border-[var(--border-color)]"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">ÜYE YÖNETİMİ</h3>
                                        <p className="text-[var(--text-muted)] font-bold text-xs mt-1 uppercase tracking-widest text-primary-500 opacity-60">{selectedProjectForMember.name}</p>
                                    </div>
                                    <button onClick={() => setShowMemberModal(false)} className="p-4 hover:bg-[var(--bg-main)] rounded-2xl transition-colors">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-60" />
                                        <input
                                            type="text"
                                            placeholder="Kullanıcı ara..."
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            className="w-full pl-11 pr-4 py-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[18px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-2 opacity-60">KULLANICILAR</h4>
                                        {users.filter(u =>
                                        (u.username.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                            u.email.toLowerCase().includes(memberSearch.toLowerCase()))
                                        ).map(u => {
                                            const isMember = selectedProjectForMember.members?.some(m => m.id === u.id);
                                            const isOwner = selectedProjectForMember.ownerId === u.id;

                                            return (
                                                <div key={u.id} className="flex items-center justify-between p-4 bg-[var(--bg-main)] rounded-[20px] border border-[var(--border-color)]/50 hover:bg-[var(--bg-surface)] transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-[var(--bg-surface)] rounded-xl flex items-center justify-center font-black text-primary-600 border border-[var(--border-color)] overflow-hidden shadow-sm">
                                                            {u.avatarUrl ? (
                                                                <img src={getAvatarUrl(u.avatarUrl)} alt={u.username} className="w-full h-full object-cover" />
                                                            ) : (
                                                                u.username[0].toUpperCase()
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-[var(--text-main)]">{u.username}</span>
                                                            <span className="text-xs text-[var(--text-muted)] font-medium opacity-60">{u.email}</span>
                                                        </div>
                                                    </div>

                                                    {isOwner ? (
                                                        <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 dark:border-indigo-500/20">PROJE SAHİBİ</span>
                                                    ) : isMember ? (
                                                        <button
                                                            onClick={() => handleRemoveMember(selectedProjectForMember.id, u.id)}
                                                            className="px-4 py-2 bg-[var(--bg-surface)] text-red-500 border border-red-100 dark:border-red-500/20 rounded-xl text-xs font-black hover:bg-red-50 dark:hover:bg-red-500/10 transition-all uppercase tracking-widest"
                                                        >
                                                            ÇIKAR
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddMember(u.id)}
                                                            className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-black hover:bg-primary-700 transition-all uppercase tracking-widest"
                                                        >
                                                            EKLE
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectCenter;
