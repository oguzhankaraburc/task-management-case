import React, { useEffect, useState } from 'react';
import authService from '../../services/auth.service';
import {
    Users,
    Trash2,
    Settings,
    Search,
    Filter,
    ChevronDown,
    Loader2,
    X,
    Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import getAvatarUrl from '../../utils/avatarHelper';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [isSearching, setIsSearching] = useState(false);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'User' });
    const { showToast } = useToast();

    const fetchUsers = async (uSearch = '', role = 'All', silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setIsSearching(true);
            const data = await authService.getAllUsers(uSearch, role);
            setUsers(data);
        } catch (err) {
            showToast('Kullanıcılar yüklenemedi.', 'error');
        } finally {
            setLoading(false);
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(userSearch, roleFilter, true);
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch, roleFilter]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await authService.createUser(newUser);
            showToast('Kullanıcı başarıyla oluşturuldu!', 'success');
            setNewUser({ username: '', email: '', password: '', role: 'User' });
            fetchUsers(userSearch, roleFilter);
        } catch (err) {
            showToast(err.response?.data?.message || 'Kullanıcı oluşturulamadı.', 'error');
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await authService.updateUser(editingUser.id, editingUser);
            showToast('Kullanıcı güncellendi!', 'success');
            setShowEditModal(false);
            setEditingUser(null);
            fetchUsers(userSearch, roleFilter);
        } catch (err) {
            showToast('Güncelleme başarısız.', 'error');
        }
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await authService.deleteUser(userToDelete.id);
            showToast('Kullanıcı silindi.', 'success');
            fetchUsers(userSearch, roleFilter);
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (err) {
            showToast('Kullanıcı silinemedi.', 'error');
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
                <h2 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase">KULLANICI YÖNETİMİ</h2>
                <p className="text-[var(--text-muted)] font-bold mt-2 text-sm opacity-60">Sistemdeki tüm kullanıcıları görüntüleyin, rollerini düzenleyin veya yeni kullanıcı ekleyin.</p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 2xl:grid-cols-3 gap-8 w-full"
            >
                <div className="2xl:col-span-2 space-y-4">
                    <div className="bg-[var(--bg-surface)] rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col max-h-[800px] border border-[var(--border-color)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-color)] flex flex-wrap lg:flex-nowrap justify-between items-center bg-[var(--bg-surface)] sticky top-0 z-[60] gap-4">
                            <h3 className="font-black text-[var(--text-main)] uppercase tracking-tighter flex-shrink-0">Sistem Kullanıcıları</h3>

                            <div className="flex flex-1 gap-3 max-w-2xl min-w-[300px]">
                                <div className="relative flex-1 group">
                                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-primary-500 animate-pulse' : 'text-[var(--text-muted)]'}`} />
                                    <input
                                        type="text"
                                        placeholder="İsim veya email ile ara..."
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[16px] text-sm font-bold outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                    />
                                </div>

                                <div className="relative min-w-[160px]">
                                    <button
                                        type="button"
                                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                        className="w-full pl-10 pr-4 h-[52px] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[16px] text-sm font-bold outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all text-[var(--text-main)] flex items-center justify-between"
                                    >
                                        <span>{roleFilter === 'All' ? 'Tüm Roller' : roleFilter}</span>
                                        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />

                                    <AnimatePresence>
                                        {showRoleDropdown && (
                                            <>
                                                <div className="fixed inset-0 z-[130]" onClick={() => setShowRoleDropdown(false)} />
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 4 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 z-[140] mt-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] overflow-hidden p-2"
                                                >
                                                    {['All', 'Admin', 'User'].map((role) => (
                                                        <button
                                                            key={role}
                                                            onClick={() => {
                                                                setRoleFilter(role);
                                                                setShowRoleDropdown(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-2.5 rounded-[12px] text-sm font-bold transition-all ${roleFilter === role ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600' : 'text-[var(--text-muted)] hover:bg-[var(--bg-main)]'}`}
                                                        >
                                                            {role === 'All' ? 'Tüm Roller' : role}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-main)] text-[var(--text-muted)] px-4 py-1.5 rounded-full text-[11px] font-black border border-[var(--border-color)] flex-shrink-0">{users.length} Kayıt</div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar flex-1">
                            <table className="w-full text-left border-collapse relative min-w-[700px]">
                                <thead className="sticky top-0 z-20 bg-[var(--bg-main)]">
                                    <tr className="bg-[var(--bg-main)]/80 backdrop-blur-sm">
                                        <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Kullanıcı</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Email</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Yetki</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60 text-right">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-color)]/30">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-[var(--bg-main)]/50 transition-colors group">
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 bg-primary-50/50 dark:bg-primary-500/10 rounded-[14px] flex items-center justify-center font-black text-primary-600 border border-primary-100/50 dark:border-primary-500/20 overflow-hidden">
                                                        {u.avatarUrl ? (
                                                            <img src={getAvatarUrl(u.avatarUrl)} alt={u.username} className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.username[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="font-bold text-[var(--text-main)]">{u.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 font-medium text-[var(--text-muted)] opacity-80">{u.email}</td>
                                            <td className="px-8 py-7">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-widest ${u.role === 'Admin'
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 border-indigo-100/50 dark:border-indigo-500/20'
                                                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border-emerald-100/50 dark:border-emerald-500/20'
                                                    }`}>
                                                    {u.role === 'Admin' ? 'ADMİN' : 'USER'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-7 text-right flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingUser({ ...u, password: '' });
                                                        setShowEditModal(true);
                                                    }}
                                                    className="text-[var(--text-muted)] opacity-50 hover:opacity-100 hover:text-primary-600 p-2 transition-all"
                                                    title="Düzenle"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                                {u.role !== 'Admin' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(u)}
                                                        className="text-[var(--text-muted)] opacity-50 hover:opacity-100 hover:text-red-500 p-2 transition-all"
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--bg-surface)] p-10 rounded-[40px] border border-[var(--border-color)] shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                        <h3 className="text-xl font-black text-[var(--text-main)] mb-6 uppercase tracking-tight">Yeni Kullanıcı Ekle</h3>
                        <form onSubmit={handleCreateUser} className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">KULLANICI ADI</label>
                                <input
                                    className="w-full p-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                    placeholder="İsim soyisim..."
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">E-POSTA</label>
                                <input
                                    type="email"
                                    className="w-full p-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                    placeholder="email@adres.com"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">ŞİFRE</label>
                                <input
                                    type="password"
                                    className="w-full p-4 bg-[var(--bg-main)] border-2 border-transparent rounded-[12px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 focus:shadow-sm transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50"
                                    placeholder="••••••"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">ROL</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Admin', 'User'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setNewUser({ ...newUser, role: r })}
                                            className={`py-3 rounded-[12px] font-black transition-all border-2 uppercase tracking-widest text-[10px] ${newUser.role === r
                                                ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500/30 text-primary-600 shadow-sm'
                                                : 'bg-[var(--bg-main)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                                                }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[16px] font-black shadow-lg shadow-primary-500/20 transition-all duration-300 transform active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]">
                                KULLANICIYI OLUŞTUR
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>

            {/* Edit User Modal */}
            <AnimatePresence>
                {showEditModal && editingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditModal(false)}
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
                                    <div>
                                        <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">Kullanıcıyı Düzenle</h3>
                                    </div>
                                    <button onClick={() => setShowEditModal(false)} className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-colors">
                                        <X className="w-6 h-6 text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateUser}>
                                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar -mr-2">
                                        <div className="space-y-6 px-1 pb-1">
                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">KULLANICI ADI</label>
                                                <input
                                                    className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)]"
                                                    value={editingUser.username}
                                                    onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">E-POSTA</label>
                                                <input
                                                    type="email"
                                                    className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)]"
                                                    value={editingUser.email}
                                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">Rol</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['Admin', 'User'].map((r) => (
                                                        <button
                                                            key={r}
                                                            type="button"
                                                            onClick={() => setEditingUser({ ...editingUser, role: r })}
                                                            className={`py-4 rounded-2xl font-black transition-all border-2 uppercase tracking-widest text-[11px] ${editingUser.role === r
                                                                ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500/30 text-primary-600 shadow-sm'
                                                                : 'bg-[var(--bg-main)] border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                                                                }`}
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest px-1 opacity-60">ŞİFRE (BOŞ BIRAKABİLİRSİNİZ)</label>
                                                <input
                                                    type="password"
                                                    className="w-full p-4.5 bg-[var(--bg-main)] border-2 border-transparent rounded-[16px] outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/20 transition-all font-bold text-[var(--text-main)]"
                                                    value={editingUser.password}
                                                    onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-8 border-t border-[var(--border-color)] mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
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

            {/* User Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && userToDelete && (
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
                            <h3 className="text-2xl font-black text-[var(--text-main)] mb-2 uppercase tracking-tight">Kullanıcıyı Sil</h3>
                            <p className="text-[var(--text-muted)] font-medium mb-8 opacity-80">
                                <span className="font-black text-[var(--text-main)]">{userToDelete.username}</span> kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-4 bg-[var(--bg-main)] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-[20px] font-black transition-all uppercase tracking-widest text-[12px]"
                                >
                                    İPTAL
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-[20px] font-black shadow-lg shadow-red-200 transition-all uppercase tracking-widest text-[12px]"
                                >
                                    EVET, SİL
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;
