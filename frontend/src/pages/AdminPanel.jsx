import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import taskService from '../services/task.service';
import projectService from '../services/project.service';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);

    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [projectOwnerId, setProjectOwnerId] = useState('');

    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'User'
    });

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        projectId: '',
        assignedUserId: ''
    });

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });

    const { logout } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userData, taskData, projectData] = await Promise.all([
                authService.getUsers(),
                taskService.getAllTasks(),
                projectService.getProjects()
            ]);
            setUsers(userData);
            setTasks(taskData);
            setProjects(projectData);

            if (userData.length > 0) {
                setProjectOwnerId(userData[0].id);
                setNewTask(prev => ({ ...prev, assignedUserId: userData[0].id }));
            }
            if (projectData.length > 0) {
                setNewTask(prev => ({ ...prev, projectId: projectData[0].id }));
            }
        } catch (err) {
            console.error('Veri çekme hatası:', err);
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

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await projectService.createProject(projectName, projectDesc, projectOwnerId);
            showMessage('Proje başarıyla oluşturuldu!');
            setProjectName('');
            setProjectDesc('');
            fetchData();
        } catch (err) {
            alert('Proje oluşturulamadı.');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await authService.createUser(
                newUser.username,
                newUser.email,
                newUser.password,
                newUser.role
            );
            showMessage('Kullanıcı başarıyla oluşturuldu!');
            setNewUser({ username: '', email: '', password: '', role: 'User' });
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Kullanıcı oluşturulamadı.';
            alert(msg);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            if (!newTask.projectId) return alert('Lütfen bir proje seçin.');
            await taskService.createTask(newTask);
            showMessage('Görev başarıyla oluşturuldu!');
            setNewTask({
                ...newTask,
                title: '',
                description: '',
                status: 'Todo',
                priority: 'Medium'
            });
            fetchData();
        } catch (err) {
            alert('Görev oluşturulamadı.');
        }
    };

    if (loading) return <div style={styles.center}>Yükleniyor...</div>;

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>Admin Paneli</h1>
                <button onClick={logout} style={styles.logoutBtn}>Çıkış Yap</button>
            </header>

            {message.text && (
                <div style={{
                    ...styles.alert,
                    backgroundColor: message.type === 'success' ? '#defadb' : '#ffe3e3',
                    color: message.type === 'success' ? '#1e7e34' : '#d63031'
                }}>
                    {message.text}
                </div>
            )}

            <div style={styles.grid}>
                {/* Kullanıcı Yönetimi */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Kullanıcı Listesi</h2>
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tr}>
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Kullanıcı Adı</th>
                                    <th style={styles.th}>Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={styles.tr}>
                                        <td style={styles.td}>{u.id}</td>
                                        <td style={styles.td}>{u.username}</td>
                                        <td style={styles.td}>{u.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Yeni Kullanıcı Oluştur */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Yeni Kullanıcı Ekle</h2>
                    <form onSubmit={handleCreateUser} style={styles.form}>
                        <input
                            placeholder="Kullanıcı Adı"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Şifre"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            style={styles.input}
                        >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <button type="submit" style={{ ...styles.button, backgroundColor: '#3498db' }}>Kullanıcıyı Kaydet</button>
                    </form>
                </section>

                {/* Proje Oluşturma */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Yeni Proje Tanımla</h2>
                    <form onSubmit={handleCreateProject} style={styles.form}>
                        <input
                            placeholder="Proje Adı"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                            style={styles.input}
                        />
                        <textarea
                            placeholder="Proje Açıklaması"
                            value={projectDesc}
                            onChange={(e) => setProjectDesc(e.target.value)}
                            style={styles.textarea}
                        />
                        <div style={styles.selectGroup}>
                            <label>Proje Sahibi Seçin:</label>
                            <select
                                value={projectOwnerId}
                                onChange={(e) => setProjectOwnerId(e.target.value)}
                                style={styles.input}
                            >
                                {users
                                    .filter(u => u.role === 'Admin' || u.role === 'User')
                                    .map(u => (
                                        <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                                    ))
                                }
                            </select>
                        </div>
                        <button type="submit" style={styles.button}>Projeyi Oluştur</button>
                    </form>
                </section>

                {/* Yeni Görev Oluştur */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Yeni Görev Ekle</h2>
                    <form onSubmit={handleCreateTask} style={styles.form}>
                        <input
                            placeholder="Görev Başlığı"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            required
                            style={styles.input}
                        />
                        <textarea
                            placeholder="Görev Açıklaması"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            style={styles.textarea}
                        />
                        <div style={styles.grid2}>
                            <div style={styles.selectGroup}>
                                <label>Proje:</label>
                                <select
                                    value={newTask.projectId}
                                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Proje Seçin</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.selectGroup}>
                                <label>Atanacak Kişi:</label>
                                <select
                                    value={newTask.assignedUserId}
                                    onChange={(e) => setNewTask({ ...newTask, assignedUserId: e.target.value })}
                                    style={styles.input}
                                    required
                                >
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.username}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div style={styles.grid2}>
                            <div style={styles.selectGroup}>
                                <label>Öncelik:</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div style={styles.selectGroup}>
                                <label>Durum:</label>
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" style={{ ...styles.button, backgroundColor: '#f39c12' }}>Görevi Kaydet</button>
                    </form>
                </section>

                {/* Proje Listesi */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Sistemdeki Projeler</h2>
                    <div style={styles.projectGrid}>
                        {projects.length === 0 ? (
                            <p>Henüz proje oluşturulmadı.</p>
                        ) : (
                            projects.map(p => (
                                <div key={p.id} style={styles.projectCard}>
                                    <h3 style={styles.projectTitle}>{p.name}</h3>
                                    <p style={styles.projectDesc}>{p.description}</p>
                                    <span style={styles.ownerInfo}>Sahip: <strong>{p.owner?.username}</strong></span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Tüm Görevler */}
                <section style={{ ...styles.section, gridColumn: '1 / -1' }}>
                    <h2 style={styles.sectionTitle}>Görev Genel Bakışı</h2>
                    <div style={styles.taskGrid}>
                        {tasks.length === 0 ? (
                            <p>Sistemde henüz kayıtlı görev yok.</p>
                        ) : (
                            tasks.map(t => (
                                <div key={t.id} style={styles.card}>
                                    <div style={styles.cardInfo}>
                                        <strong>{t.title}</strong>
                                        <span style={styles.assignedTo}>Atanan: {t.assignedUser?.username || 'Belirtilmedi'}</span>
                                    </div>
                                    <div style={styles.cardMeta}>
                                        <span>Proje: {t.project?.name || 'Genel'}</span>
                                        <span style={{
                                            ...styles.statusText,
                                            color: t.status === 'Done' ? '#2ecc71' :
                                                t.status === 'In Progress' ? '#3498db' : '#f39c12'
                                        }}>{t.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f0f2f5', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' },
    title: { color: '#1a1a1a', fontSize: '2rem', fontWeight: 'bold' },
    logoutBtn: { padding: '0.6rem 1.2rem', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.3s' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    section: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    sectionTitle: { marginBottom: '1.2rem', color: '#2c3e50', fontSize: '1.3rem', fontWeight: '700', borderLeft: '4px solid #3498db', paddingLeft: '1rem' },
    tableWrapper: { maxHeight: '300px', overflowY: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '1rem', backgroundColor: '#f8f9fa', borderBottom: '2px solid #edf2f7', color: '#4a5568' },
    td: { padding: '1rem', borderBottom: '1px solid #edf2f7', color: '#2d3748' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' },
    textarea: { padding: '0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', minHeight: '80px', resize: 'vertical' },
    button: { padding: '0.8rem', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'transform 0.1s' },
    alert: { padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600' },
    projectGrid: { display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '8px' },
    projectCard: { padding: '1.2rem', border: '1px solid #edf2f7', borderRadius: '12px', backgroundColor: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: '0.6rem', transition: 'all 0.2s', borderLeft: '4px solid #3498db' },
    projectTitle: { margin: 0, fontSize: '1.1rem', color: '#2d3748', fontWeight: '700' },
    projectDesc: { margin: 0, fontSize: '0.85rem', color: '#718096', lineHeight: '1.4' },
    ownerInfo: { fontSize: '0.8rem', color: '#a0aec0', marginTop: '4px', borderTop: '1px dashed #edf2f7', paddingTop: '6px' },
    taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' },
    card: { padding: '1.2rem', borderRadius: '15px', border: '1px solid #edf2f7', backgroundColor: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
    cardInfo: { display: 'flex', flexDirection: 'column', marginBottom: '0.8rem' },
    assignedTo: { fontSize: '0.85rem', color: '#718096', marginTop: '0.3rem' },
    cardMeta: { fontSize: '0.85rem', color: '#a0aec0', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f7fafc', paddingTop: '0.8rem' },
    statusText: { fontWeight: 'bold' },
    center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem', color: '#3498db' },
    selectGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
};

export default AdminPanel;
