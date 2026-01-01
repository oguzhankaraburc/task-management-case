import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import taskService from '../services/task.service';
import projectService from '../services/project.service';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        projectId: ''
    });

    const { user, logout } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taskData, projectData] = await Promise.all([
                taskService.getMyTasks(),
                projectService.getProjects()
            ]);
            setTasks(taskData);
            setProjects(projectData);

            if (projectData.length > 0 && !newTask.projectId) {
                setNewTask(prev => ({ ...prev, projectId: projectData[0].id }));
            }
        } catch (err) {
            setError('Veriler yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            if (!newTask.projectId) return alert('Lütfen bir proje seçin.');

            const taskToCreate = {
                ...newTask,
                assignedUserId: user.id
            };

            await taskService.createTask(taskToCreate);
            showMessage('Görev başarıyla oluşturuldu! ✅');
            setNewTask({
                ...newTask,
                title: '',
                description: '',
                status: 'Todo',
                priority: 'Medium'
            });
            setShowTaskForm(false);
            fetchData();
        } catch (err) {
            showMessage(err.response?.data?.message || err.message, 'error');
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await taskService.updateTaskStatus(taskId, newStatus);
            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, status: newStatus } : task
            ));
            showMessage('Durum başarıyla güncellendi! 🎉');
        } catch (err) {
            showMessage('Durum güncellenemedi.', 'error');
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            try {
                await taskService.deleteTask(taskId);
                setTasks(tasks.filter(task => task.id !== taskId));
            } catch (err) {
                alert('Görev silinemedi.');
            }
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'High': return { bg: '#fff1f0', color: '#ff4d4f', border: '#ffa39e' };
            case 'Medium': return { bg: '#fffbe6', color: '#faad14', border: '#ffe58f' };
            case 'Low': return { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' };
            default: return { bg: '#f5f5f5', color: '#8c8c8c', border: '#d9d9d9' };
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Done': return { bg: '#f6ffed', color: '#52c41a', border: '#b7eb8f' };
            case 'In Progress': return { bg: '#e6f7ff', color: '#1890ff', border: '#91d5ff' };
            case 'Todo': return { bg: '#f5f5f5', color: '#8c8c8c', border: '#d9d9d9' };
            default: return { bg: '#f5f5f5', color: '#8c8c8c', border: '#d9d9d9' };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <div style={styles.center}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerInfo}>
                    <h1 style={styles.title}>Görev Paneli</h1>
                    <p style={styles.subtitle}>Tekrar hoş geldin, <strong>{user?.username}</strong> ({user?.email})</p>
                </div>
                <div style={styles.headerActions}>
                    <button
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        style={styles.addBtn}
                    >
                        {showTaskForm ? 'İptal' : '+ Görev Ekle'}
                    </button>
                    <button onClick={logout} style={styles.logoutBtn}>Çıkış</button>
                </div>
            </header>

            {message.text && (
                <div style={{
                    ...styles.toast,
                    backgroundColor: message.type === 'success' ? '#2ecc71' : '#e74c3c'
                }}>
                    {message.text}
                </div>
            )}

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.mainGrid}>
                {/* Sol Taraf: Görevler */}
                <div style={styles.tasksSection}>
                    {/* Yeni Görev Formu */}
                    {showTaskForm && (
                        <div style={styles.formContainer}>
                            <h2 style={styles.formTitle}>Yeni Görev Oluştur</h2>
                            <form onSubmit={handleCreateTask} style={styles.form}>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Görev Başlığı</label>
                                        <input
                                            placeholder="Başlık girin..."
                                            value={newTask.title}
                                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            required
                                            style={styles.input}
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Proje Seçin</label>
                                        <select
                                            value={newTask.projectId}
                                            onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                                            style={styles.selectInput}
                                            required
                                        >
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Açıklama</label>
                                    <textarea
                                        placeholder="Açıklama girin..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                        style={styles.textarea}
                                    />
                                </div>
                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Öncelik</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                            style={styles.selectInput}
                                        >
                                            <option value="Low">Düşük (Low)</option>
                                            <option value="Medium">Orta (Medium)</option>
                                            <option value="High">Yüksek (High)</option>
                                        </select>
                                    </div>
                                    <button type="submit" style={styles.submitBtn}>Görevi Oluştur</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <h2 style={styles.sectionTitle}>Görevlerim</h2>
                    <div style={styles.taskGrid}>
                        {tasks.length === 0 ? (
                            <div style={styles.noTasks}>
                                <p>Henüz atanmış bir göreviniz bulunmuyor.</p>
                            </div>
                        ) : (
                            tasks.map(task => {
                                const pStyle = getPriorityStyles(task.priority);
                                const sStyle = getStatusStyles(task.status);

                                return (
                                    <div key={task.id} style={styles.card}>
                                        <div style={styles.cardHeader}>
                                            <div style={styles.badgeGroup}>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: pStyle.bg,
                                                    color: pStyle.color,
                                                    borderColor: pStyle.border
                                                }}>
                                                    {task.priority}
                                                </span>
                                                <span style={{
                                                    ...styles.badge,
                                                    backgroundColor: sStyle.bg,
                                                    color: sStyle.color,
                                                    borderColor: sStyle.border
                                                }}>
                                                    {task.status}
                                                </span>
                                            </div>
                                            <h3 style={styles.taskTitle}>{task.title}</h3>
                                        </div>

                                        <p style={styles.description}>{task.description}</p>

                                        <div style={styles.metaInfo}>
                                            <div style={styles.metaItem}>
                                                <strong>Proje:</strong> {task.project?.name || 'Genel'}
                                            </div>
                                            <div style={styles.metaItem}>
                                                <strong>Tarih:</strong> {formatDate(task.createdAt)}
                                            </div>
                                        </div>

                                        <div style={styles.actionSection}>
                                            <div style={styles.updateGroup}>
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                                    style={styles.select}
                                                >
                                                    <option value="Todo">Todo</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Done">Done</option>
                                                </select>
                                                <button
                                                    onClick={() => handleStatusChange(task.id, task.status)}
                                                    style={styles.updateBtn}
                                                >
                                                    Durumu Güncelle
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(task.id)}
                                                style={styles.deleteBtn}
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sağ Taraf: Projeler */}
                <div style={styles.projectsSidebar}>
                    <h2 style={styles.sectionTitle}>Atandığım Projeler</h2>
                    <div style={styles.projectList}>
                        {projects.length === 0 ? (
                            <p style={styles.noProjects}>Henüz atanmış proje yok.</p>
                        ) : (
                            projects.map(p => (
                                <div key={p.id} style={styles.projectItem}>
                                    <h4 style={styles.projectName}>{p.name}</h4>
                                    <p style={styles.projectDesc}>{p.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f4f7f9' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: 'white', padding: '1.2rem 2rem', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'relative' },
    toast: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', padding: '1rem 2rem', color: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', zIndex: 1000, fontWeight: '600', animation: 'slideIn 0.3s ease-out' },
    headerInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    headerActions: { display: 'flex', gap: '1rem' },
    title: { margin: 0, fontSize: '1.6rem', color: '#2d3436', fontWeight: '800' },
    subtitle: { margin: 0, color: '#636e72', fontSize: '0.9rem' },
    addBtn: { padding: '0.6rem 1.4rem', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    logoutBtn: { padding: '0.6rem 1.4rem', backgroundColor: '#fff', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },

    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' },

    tasksSection: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    sectionTitle: { fontSize: '1.2rem', color: '#2d3436', margin: '0 0 1rem 0', paddingLeft: '0.5rem', borderLeft: '4px solid #3498db' },

    formContainer: { backgroundColor: 'white', padding: '1.8rem', borderRadius: '15px', marginBottom: '1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' },
    formTitle: { margin: '0 0 1.2rem 0', fontSize: '1.1rem', color: '#2d3436' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'flex-end' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#747d8c' },
    input: { padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' },
    selectInput: { padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', outline: 'none' },
    textarea: { padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '60px', outline: 'none', resize: 'vertical' },
    submitBtn: { padding: '0.7rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },

    taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
    card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #edf2f7', display: 'flex', flexDirection: 'column', gap: '1rem' },
    cardHeader: { display: 'flex', flexDirection: 'column', gap: '8px' },
    badgeGroup: { display: 'flex', gap: '6px' },
    badge: { padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid', textTransform: 'uppercase' },
    taskTitle: { margin: 0, fontSize: '1.1rem', color: '#2d3436', fontWeight: '700' },
    description: { margin: 0, color: '#636e72', fontSize: '0.9rem', lineHeight: '1.5', minHeight: '3em' },
    metaInfo: { paddingTop: '0.8rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '4px' },
    metaItem: { fontSize: '0.8rem', color: '#94a3b8' },
    actionSection: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' },
    updateGroup: { display: 'flex', alignItems: 'center', gap: '8px' },
    updateLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
    select: { padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' },
    updateBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', transition: 'background 0.2s' },
    deleteBtn: { padding: '0.4rem 0.8rem', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' },

    projectsSidebar: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '15px', height: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
    projectList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    projectItem: { padding: '1rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7' },
    projectName: { margin: '0 0 5px 0', fontSize: '0.95rem', color: '#334155' },
    projectDesc: { margin: 0, fontSize: '0.8rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' },
    noProjects: { fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' },

    error: { padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #fecaca' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' },
    noTasks: { textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', backgroundColor: 'white', borderRadius: '15px' }
};

export default Dashboard;
