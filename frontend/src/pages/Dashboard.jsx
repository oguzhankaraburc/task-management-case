import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/task.service';
import projectService from '../services/project.service';
import {
    Plus,
    Calendar,
    Trash2,
    CheckCircle,
    Clock,
    AlertCircle,
    X,
    ChevronDown,
    Briefcase,
    Flag,
    Users,
    Edit3,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomDropdown from '../components/CustomDropdown';
import { useToast } from '../context/ToastContext';
import CustomDatePicker from '../components/CustomDatePicker';
import CustomUserSelect from '../components/CustomUserSelect';
import authService from '../services/auth.service';
import getAvatarUrl from '../utils/avatarHelper';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    useDroppable,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const StatusDropdown = memo(({ currentStatus, onStatusChange, onOpenChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const statuses = [
        { id: 'Todo', label: 'Todo', icon: Clock, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-500/10' },
        { id: 'In Progress', label: 'In Progress', icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { id: 'Done', label: 'Done', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { id: 'Overdue', label: 'Overdue', icon: Flag, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onOpenChange]);

    const handleToggle = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        onOpenChange?.(nextState);
    };

    const current = statuses.find(s => s.id === currentStatus) || statuses[0];

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--bg-surface)] transition-all group"
            >
                <div className="flex items-center gap-2">
                    <current.icon className={`w-4 h-4 ${current.color}`} />
                    <span className="text-xs font-bold text-[var(--text-main)]">{current.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform opacity-50 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 4 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[22px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden p-2 will-change-transform z-[100]"
                    >
                        {statuses.map((status) => (
                            <button
                                key={status.id}
                                type="button"
                                onClick={() => {
                                    onStatusChange(status.id);
                                    setIsOpen(false);
                                    onOpenChange?.(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${currentStatus === status.id
                                    ? 'bg-[var(--bg-main)] text-[var(--text-main)] pointer-events-none'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg ${status.bg} bg-opacity-10`}>
                                    <status.icon className={`w-3.5 h-3.5 ${status.color}`} />
                                </div>
                                <span className="text-xs font-bold">{status.label}</span>
                                {currentStatus === status.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});



const TaskCard = memo(({ task, onDelete, onStatusUpdate, onEdit, isDragging }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: isDragging ? 0.3 : 1,
                scale: isDragging ? 0.95 : 1,
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`bg-[var(--bg-surface)] p-5 rounded-[24px] border border-[var(--border-color)] shadow-sm hover:shadow-xl transition-all group relative cursor-grab active:cursor-grabbing ${isDropdownOpen ? 'z-50' : 'z-0'} ${task.status === 'Overdue' ? 'ring-2 ring-red-500/20 shadow-red-500/5' : ''} ${isDragging ? 'shadow-2xl border-primary-500/50' : ''}`}
        >
            {task.status === 'Overdue' && (
                <div className={`absolute -top-2.5 -right-2 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/30 border-2 border-[var(--bg-surface)] uppercase tracking-tighter z-10 ${isDragging ? 'animate-none scale-110' : 'animate-bounce'}`}>
                    Gecikmiş
                </div>
            )}
            <div className="flex justify-between items-start mb-3" onPointerDown={(e) => e.stopPropagation()}>
                <PriorityBadge priority={task.priority} />
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-[var(--text-muted)] hover:text-primary-500 transition-colors p-2 rounded-xl hover:bg-[var(--bg-main)] opacity-50 hover:opacity-100"
                        title="Düzenle"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(task)}
                        className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-500/10 opacity-50 hover:opacity-100"
                        title="Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h4 className="font-bold text-[var(--text-main)] mb-2 leading-tight uppercase tracking-tight">{task.title}</h4>
            <p className="text-sm text-[var(--text-muted)] mb-4 line-clamp-2 font-medium opacity-80">{task.description || 'Açıklama belirtilmemiş.'}</p>

            {(task.startDate || task.dueDate) && (
                <div className="flex items-center gap-2 mb-4 p-2.5 bg-[var(--bg-main)] rounded-xl border border-[var(--border-color)]">
                    {task.startDate && (
                        <div className="flex flex-col flex-1">
                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1 opacity-50">Başlangıç</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-main)]">
                                <Clock className="w-3 h-3 text-primary-500" />
                                {new Date(task.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className={`flex flex-col flex-1 ${task.startDate ? 'border-l border-[var(--border-color)] pl-3' : ''}`}>
                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1 opacity-50">Bitiş</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--text-main)]">
                                <Calendar className="w-3 h-3 text-red-500" />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] mb-4 pt-4 border-t border-[var(--border-color)]">
                <Briefcase className="w-3.5 h-3.5 opacity-50" />
                <span className="text-primary-600">{task.project?.name}</span>
            </div>

            <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
                <StatusDropdown
                    currentStatus={task.status}
                    onStatusChange={(newStatus) => onStatusUpdate(task.id, newStatus)}
                    onOpenChange={setIsDropdownOpen}
                />
            </div>
        </motion.div>
    );
});

const Column = memo(({ title, status, icon: Icon, color, tasks, onDelete, onStatusUpdate, onEdit }) => {
    const { setNodeRef } = useDroppable({
        id: status,
        data: {
            status: status
        }
    });

    return (
        <div
            ref={setNodeRef}
            className="flex flex-col h-full min-h-[500px] bg-[var(--bg-surface)]/50 rounded-[32px] p-6 border border-[var(--border-color)]"
        >
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${color} shadow-sm items-center justify-center flex bg-current/10 border border-current/10`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-[var(--text-main)] tracking-tight uppercase">{title}</h3>
                </div>
                <span className="bg-[var(--bg-main)] px-3 py-1 rounded-full text-xs font-bold text-[var(--text-muted)] border border-[var(--border-color)] shadow-sm">
                    {tasks.length}
                </span>
            </div>

            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4 flex-1">
                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onDelete={onDelete}
                            onStatusUpdate={onStatusUpdate}
                            onEdit={onEdit}
                        />
                    ))}
                    {tasks.length === 0 && (
                        <div className="h-32 border-2 border-dashed border-[var(--border-color)] rounded-[24px] flex items-center justify-center opacity-30">
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Boş</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
});

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const { user } = useAuth();
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [users, setUsers] = useState([]);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [initialStatus, setInitialStatus] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
            },
        })
    );

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        projectId: '',
        assignedUserId: '',
        startDate: '',
        dueDate: ''
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [taskData, projectData, userData] = await Promise.all([
                taskService.getMyTasks(),
                projectService.getProjects(),
                authService.getAllUsers()
            ]);
            setTasks(taskData);
            setProjects(projectData);
            setUsers(userData);

            if (projectData.length > 0 && !newTask.projectId) {
                setNewTask(prev => ({ ...prev, projectId: projectData[0].id }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [newTask.projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (user?.id && !newTask.assignedUserId) {
            setNewTask(prev => ({ ...prev, assignedUserId: user.id }));
        }
    }, [user, newTask.assignedUserId]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (isSavingTask) return;

        try {
            if (!newTask.projectId) return showToast('Lütfen bir proje seçin.', 'error');
            const taskToCreate = { ...newTask };
            if (user.role !== 'Admin') taskToCreate.assignedUserId = user.id;
            if (!taskToCreate.assignedUserId) return showToast('Lütfen bir kullanıcı seçin.', 'error');

            setIsSavingTask(true);
            await taskService.createTask(taskToCreate);
            showToast('Görev başarıyla oluşturuldu! ', 'success');
            setNewTask(prev => ({ ...prev, title: '', description: '', status: 'Todo', priority: 'Medium', startDate: '', dueDate: '' }));
            setShowTaskModal(false);
            fetchData();
        } catch (err) {
            showToast(err.response?.data?.message || 'Hata oluştu.', 'error');
        } finally {
            setIsSavingTask(false);
        }
    };

    const handleStatusUpdate = useCallback(async (taskId, newStatus) => {
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            showToast('Durum güncellendi! ', 'success');
        } catch (err) {
            showToast('Hata oluştu.', 'error');
        }
    }, [showToast]);

    const handleDeleteClick = useCallback((task) => {
        setTaskToDelete(task);
        setShowDeleteModal(true);
    }, []);

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            await taskService.deleteTask(taskToDelete.id);
            setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
            showToast('Görev silindi. ', 'success');
            setShowDeleteModal(false);
            setTaskToDelete(null);
        } catch (err) {
            showToast('Silinemedi.', 'error');
        }
    };

    const handleEditClick = (task) => {

        const normalizedTask = {
            ...task,
            startDate: task.startDate ? task.startDate.split('T')[0] : null,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : null
        };
        setEditingTask(normalizedTask);
        setShowEditTaskModal(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
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
            setShowEditTaskModal(false);
            setEditingTask(null);
            fetchData();
        } catch (err) {
            console.error('Task Update Error:', err.response?.data || err.message);
            showToast(err.response?.data?.message || 'Güncelleme başarısız.', 'error');
        }
    };

    const filteredTasks = useMemo(() => tasks.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [tasks, searchTerm]);

    const handleDragStart = (event) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task);
        setInitialStatus(task.status);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overStatus = over.data?.current?.status || over.data?.current?.task?.status;
        const activeStatus = active.data?.current?.task?.status;

        if (activeStatus && overStatus && activeStatus !== overStatus && ['Todo', 'In Progress', 'Done', 'Overdue'].includes(overStatus)) {
            setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: overStatus } : t));
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        const startStatus = initialStatus;

        setActiveTask(null);
        setInitialStatus(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;
        const overStatus = over.data?.current?.status || over.data?.current?.task?.status;

        if (!overStatus) return;

        if (startStatus !== overStatus) {
            const taskId = active.id;
            const originalTasks = [...tasks];

            try {
                await taskService.updateTaskStatus(taskId, overStatus);
                showToast('Durum güncellendi!', 'success');
            } catch (err) {
                setTasks(originalTasks);
                showToast('Güncelleme başarısız, geri alınıyor.', 'error');
            }
            return;
        }

        if (activeId !== overId) {
            const columnTasks = tasks.filter(t => t.status === startStatus);
            const oldIndex = columnTasks.findIndex(t => t.id === activeId);
            const newIndex = columnTasks.findIndex(t => t.id === overId);

            if (oldIndex !== newIndex && newIndex !== -1) {
                setTasks(prev => {
                    const otherTasks = prev.filter(t => t.status !== startStatus);
                    const movedTasks = arrayMove(columnTasks, oldIndex, newIndex);
                    return [...otherTasks, ...movedTasks];
                });
            }
        }
    };

    return (
        <div className="min-h-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">GÖREV PANELİ</h2>
                    <div className="mt-2 space-y-1">
                        <p className="text-[var(--text-muted)] font-bold text-sm opacity-80">Merhaba {user?.username}!</p>
                        <p className="text-[var(--text-muted)] text-[11px] font-medium opacity-60 max-w-lg leading-relaxed tracking-wide">
                            Görevlerinizi bu panelden yönetebilir, sürükle-bırak özelliği ile durumlarını güncelleyebilir ve projelerinizi anlık olarak denetleyebilirsiniz.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-50" />
                        <input
                            type="text"
                            placeholder="Görevlerde ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-10 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-sm font-medium outline-none focus:border-primary-500 shadow-sm transition-all focus:ring-4 focus:ring-primary-500/5 text-[var(--text-main)] placeholder:[var(--text-muted)] placeholder:opacity-30"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--bg-main)] rounded-full transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-red-500" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowTaskModal(true)}
                        className="flex items-center gap-3 bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-[22px] font-black shadow-xl shadow-primary-500/20 transition-all duration-300 transform active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <Plus className="w-5 h-5" />
                        YENİ GÖREV
                    </button>
                </div>
            </div>



            <div className="mb-10 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-6 min-w-max">
                    <div className="bg-[var(--bg-surface)] p-6 rounded-[32px] border border-[var(--border-color)] shadow-sm flex items-center gap-6 min-w-[300px]">
                        <div className="w-14 h-14 bg-amber-500/10 rounded-[22px] flex items-center justify-center border border-amber-500/20">
                            <Calendar className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <h4 className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 opacity-60">YAKLAŞAN SON TARİHLER</h4>
                            <div className="flex -space-x-2">
                                {tasks
                                    .filter(t => t.dueDate && t.status !== 'Done')
                                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                                    .slice(0, 5)
                                    .map((t, i) => (
                                        <div
                                            key={t.id}
                                            className="w-10 h-10 rounded-full border-4 border-[var(--bg-surface)] bg-[var(--bg-main)] flex items-center justify-center text-[10px] font-black text-[var(--text-main)] shadow-sm relative group cursor-pointer"
                                            title={`${t.title} - ${new Date(t.dueDate).toLocaleDateString()}`}
                                        >
                                            {t.assignedUser?.avatarUrl ? (
                                                <img src={getAvatarUrl(t.assignedUser.avatarUrl)} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-color)]">
                                                    {t.title ? t.title[0] : '?'}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center shadow-sm">
                                                <div className={`w-2 h-2 rounded-full ${t.status === 'Overdue' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                                            </div>
                                        </div>
                                    ))}
                                {tasks.filter(t => t.dueDate && t.status !== 'Done').length === 0 && (
                                    <span className="text-xs font-bold text-[var(--text-muted)] opacity-50">Yakında bitecek görev yok.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {tasks.filter(t => t.status === 'Overdue').slice(0, 3).map(t => (
                        <div key={t.id} className="bg-red-500/5 p-6 rounded-[32px] border border-red-500/20 shadow-sm flex items-center gap-6 min-w-[300px] border-l-4 border-l-red-500">
                            <div className="w-14 h-14 bg-red-500/10 rounded-[22px] flex items-center justify-center animate-pulse">
                                <Flag className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 opacity-60">GECİKMİŞ GÖREV</h4>
                                <p className="text-sm font-black text-[var(--text-main)] truncate max-w-[150px]">{t.title}</p>
                                <p className="text-[10px] font-bold text-red-500 uppercase">{new Date(t.dueDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-stretch">
                    <Column
                        title="Todo"
                        status="Todo"
                        icon={Clock}
                        color="text-primary-600 dark:text-primary-400"
                        tasks={filteredTasks.filter(t => t.status === 'Todo')}
                        onDelete={handleDeleteClick}
                        onStatusUpdate={handleStatusUpdate}
                        onEdit={handleEditClick}
                    />
                    <Column
                        title="In Progress"
                        status="In Progress"
                        icon={AlertCircle}
                        color="text-amber-600 dark:text-amber-400"
                        tasks={filteredTasks.filter(t => t.status === 'In Progress')}
                        onDelete={handleDeleteClick}
                        onStatusUpdate={handleStatusUpdate}
                        onEdit={handleEditClick}
                    />
                    <Column
                        title="Done"
                        status="Done"
                        icon={CheckCircle}
                        color="text-emerald-600 dark:text-emerald-400"
                        tasks={filteredTasks.filter(t => t.status === 'Done')}
                        onDelete={handleDeleteClick}
                        onStatusUpdate={handleStatusUpdate}
                        onEdit={handleEditClick}
                    />
                </div>

                <DragOverlay dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeTask ? (
                        <div className="w-full scale-105 rotate-2 transition-transform shadow-2xl">
                            <TaskCard
                                task={activeTask}
                                isDragging
                                onDelete={() => { }}
                                onStatusUpdate={() => { }}
                                onEdit={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>


            <AnimatePresence>
                {showTaskModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTaskModal(false)}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-surface)] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden cursor-default border border-[var(--border-color)]"
                        >
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase">YENİ GÖREV OLUŞTUR</h3>
                                    <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors opacity-50 hover:opacity-100">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateTask}>
                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                        <div className="grid grid-cols-2 gap-5 px-1 pb-1">
                                            <div className="col-span-2">
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2.5 uppercase tracking-widest px-1 opacity-60">GÖREV BAŞLIĞI</label>
                                                <input
                                                    className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] placeholder:[var(--text-muted)] placeholder:opacity-30 border border-[var(--border-color)]"
                                                    placeholder="Görev adı giriniz..."
                                                    value={newTask.title}
                                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <CustomDropdown
                                                label="PROJE SEÇİMİ"
                                                icon={Briefcase}
                                                options={projects.map(p => ({ id: p.id, label: p.name }))}
                                                value={newTask.projectId}
                                                onChange={(val) => setNewTask({ ...newTask, projectId: val })}
                                                placeholder="Proje Seçin"
                                            />

                                            <CustomDropdown
                                                label="ÖNCELİK SEVİYESİ"
                                                icon={Flag}
                                                options={[
                                                    { id: 'Low', label: 'Düşük', dot: 'bg-emerald-400' },
                                                    { id: 'Medium', label: 'Orta', dot: 'bg-amber-400' },
                                                    { id: 'High', label: 'Yüksek', dot: 'bg-red-400' }
                                                ]}
                                                value={newTask.priority}
                                                onChange={(val) => setNewTask({ ...newTask, priority: val })}
                                            />

                                            {(user.role === 'Admin' || projects.find(p => p.id === newTask.projectId)?.ownerId === user.id) && (
                                                <div className="col-span-2">
                                                    {(() => {
                                                        const selectedProject = projects.find(p => p.id === newTask.projectId);
                                                        const availableUsers = selectedProject
                                                            ? [selectedProject.owner, ...(selectedProject.members || [])].filter(Boolean)
                                                            : [];

                                                        return (
                                                            <CustomDropdown
                                                                label="GÖREV ATANACAK KİŞİ"
                                                                icon={Users}
                                                                options={availableUsers.map(u => ({ id: u.id, label: u.username }))}
                                                                value={newTask.assignedUserId}
                                                                onChange={(val) => setNewTask({ ...newTask, assignedUserId: val })}
                                                                placeholder={selectedProject ? "Üye Seçin" : "Önce Proje Seçin"}
                                                            />
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <CustomDatePicker
                                                label="BAŞLANGIÇ TARİHİ"
                                                selectedDate={newTask.startDate}
                                                onSelect={(date) => setNewTask({ ...newTask, startDate: date })}
                                            />
                                            <CustomDatePicker
                                                label="BİTİŞ TARİHİ"
                                                selectedDate={newTask.dueDate}
                                                onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2.5 uppercase tracking-widest px-1 opacity-60">ÖZET / AÇIKLAMA</label>
                                            <textarea
                                                className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] min-h-[140px] placeholder:[var(--text-muted)] placeholder:opacity-30 resize-none border border-[var(--border-color)]"
                                                placeholder="Görevle ilgili önemli notlar ekleyin..."
                                                value={newTask.description}
                                                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-8 border-t border-[var(--border-color)] mt-6">
                                        <button
                                            type="submit"
                                            disabled={isSavingTask}
                                            className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] font-black shadow-xl shadow-primary-500/20 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-[0.15em] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSavingTask ? 'İŞLENİYOR...' : 'GÖREVİ OLUŞTUR'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                        className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--bg-surface)] w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden cursor-default relative border border-[var(--border-color)]"
                        >
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Trash2 className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">EMİN MİSİNİZ?</h3>
                                <p className="text-[var(--text-muted)] font-medium mb-8">
                                    "<span className="text-[var(--text-main)] font-bold">{taskToDelete?.title}</span>" görevi kalıcı olarak silinecek.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="flex-1 py-4.5 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-[20px] font-black transition-all active:scale-95 uppercase tracking-widest text-[11px] border border-[var(--border-color)]"
                                    >
                                        VAZGEÇ
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="flex-1 py-4.5 bg-red-500 hover:bg-red-600 text-white rounded-[20px] font-black shadow-lg shadow-red-500/20 transition-all active:scale-95 uppercase tracking-widest text-[11px]"
                                    >
                                        EVET, SİL
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showEditTaskModal && editingTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditTaskModal(false)}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md cursor-pointer"
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
                                    <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tight uppercase">GÖREVİ DÜZENLE</h3>
                                    <button onClick={() => setShowEditTaskModal(false)} className="p-2 hover:bg-[var(--bg-main)] rounded-full transition-colors opacity-50 hover:opacity-100">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>
                                <form onSubmit={handleUpdateTask}>
                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                        <div>
                                            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">GÖREV BAŞLIĞI</label>
                                            <input
                                                className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] border border-[var(--border-color)]"
                                                placeholder="Başlık yazın..."
                                                value={editingTask.title}
                                                onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">AÇIKLAMA</label>
                                            <textarea
                                                className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)] min-h-[100px] resize-none border border-[var(--border-color)]"
                                                placeholder="Görev detaylarını yazın..."
                                                value={editingTask.description || ''}
                                                onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <CustomDropdown
                                                label="Durum    "
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
                                                label="ÖNCELİK"
                                                options={[
                                                    { id: 'Low', label: 'Düşük', dot: 'bg-slate-400' },
                                                    { id: 'Medium', label: 'Orta', dot: 'bg-blue-500' },
                                                    { id: 'High', label: 'Yüksek', dot: 'bg-red-500' }
                                                ]}
                                                value={editingTask.priority}
                                                onChange={(val) => setEditingTask({ ...editingTask, priority: val })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <CustomDatePicker
                                                label="BAŞLANGIÇ"
                                                selectedDate={editingTask.startDate}
                                                onSelect={(date) => setEditingTask({ ...editingTask, startDate: date })}
                                            />
                                            <CustomDatePicker
                                                label="BİTİŞ TARİHİ"
                                                selectedDate={editingTask.dueDate}
                                                onSelect={(date) => setEditingTask({ ...editingTask, dueDate: date })}
                                            />
                                        </div>

                                        {(user.role === 'Admin' || editingTask.project?.ownerId === user.id) && (
                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">ATANAN KULLANICI</label>
                                                <CustomUserSelect
                                                    users={users}
                                                    selectedUserId={editingTask.assignedUserId}
                                                    onSelect={(val) => setEditingTask({ ...editingTask, assignedUserId: val })}
                                                    label=""
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-4 pt-8 border-t border-[var(--border-color)] mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditTaskModal(false)}
                                            className="flex-1 py-5 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-[20px] font-black transition-all uppercase tracking-widest text-[13px]"
                                        >
                                            İPTAL
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSavingTask}
                                            className="flex-[2] py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[20px] font-black shadow-xl shadow-primary-500/20 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-widest text-[13px] disabled:opacity-50"
                                        >
                                            {isSavingTask ? 'KAYDEDİLİYOR...' : 'GÜNCELLEMEYİ KAYDET'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )
                }
            </AnimatePresence >
        </div >
    );
};

export default Dashboard;
