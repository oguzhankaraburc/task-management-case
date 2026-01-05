import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Camera, Check } from 'lucide-react';
import authService from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import getAvatarUrl from '../utils/avatarHelper';
import { useToast } from '../context/ToastContext';

const DEFAULT_AVATARS = [
    { id: 1, url: 'https://api.dicebear.com/9.x/personas/svg?seed=Brian' },
    { id: 2, url: 'https://api.dicebear.com/9.x/personas/svg?seed=Andrea' },
    { id: 3, url: 'https://api.dicebear.com/9.x/personas/svg?seed=Jude' },
    { id: 4, url: 'https://api.dicebear.com/9.x/personas/svg?seed=Christian' },
    { id: 5, url: 'https://api.dicebear.com/9.x/personas/svg?seed=Easton' },
];

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, login } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        avatarUrl: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                password: '',
                avatarUrl: user.avatarUrl || '',
            });
        }
    }, [isOpen, user]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('avatar', file);

        try {
            const data = await authService.uploadAvatar(uploadData);
            setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
            showToast('Görsel başarıyla yüklendi! ', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Yükleme başarısız.', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await authService.updateProfile({
                username: formData.username,
                email: formData.email,
                avatarUrl: formData.avatarUrl,
                password: formData.password || undefined
            });

            login(response.data.accessToken);

            onClose();
            showToast('Profil başarıyla güncellendi! ', 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Güncelleme başarısız.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        className="bg-[var(--bg-surface)] w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden relative z-[10001] border border-[var(--border-color)]"
                    >
                        <div className="p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-main)] uppercase tracking-tight">PROFİL AYARLARI</h3>
                                    <p className="text-[var(--text-muted)] font-bold text-xs mt-1 uppercase tracking-widest opacity-60">Bilgilerini ve görünümünü özelleştir</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 hover:bg-[var(--bg-main)] rounded-2xl transition-all hover:rotate-90 duration-300"
                                >
                                    <X className="w-6 h-6 text-[var(--text-muted)]" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex flex-col items-center justify-center -mt-4 mb-2">
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-3xl bg-[var(--bg-main)] border-4 border-[var(--bg-surface)] shadow-2xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
                                            {formData.avatarUrl ? (
                                                <img src={getAvatarUrl(formData.avatarUrl)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-black text-primary-500 uppercase">
                                                    {formData.username?.[0] || '?'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-4 opacity-50">Görünüm Önizleme</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1 opacity-60">STİLİNİ SEÇ</label>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, avatarUrl: '' })}
                                            className={`relative w-14 h-14 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center border-2 transition-all transform active:scale-95 ${!formData.avatarUrl ? 'border-primary-500 shadow-lg shadow-primary-500/20 scale-110' : 'border-[var(--border-color)] hover:border-primary-500/50'
                                                }`}
                                            title="Avatar Yok"
                                        >
                                            <User className="w-6 h-6 text-[var(--text-muted)]" />
                                            {!formData.avatarUrl && (
                                                <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                                                    <div className="bg-primary-500 rounded-full p-0.5 shadow-sm">
                                                        <Check className="w-2.5 h-2.5 text-white font-bold" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>

                                        {DEFAULT_AVATARS.map((av) => (
                                            <button
                                                key={av.id}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, avatarUrl: av.url })}
                                                className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all transform active:scale-95 ${formData.avatarUrl === av.url ? 'border-primary-500 shadow-lg shadow-primary-500/20 scale-110' : 'border-[var(--border-color)] hover:border-primary-500/50'
                                                    }`}
                                            >
                                                <img src={getAvatarUrl(av.url)} alt="Avatar" className="w-full h-full object-cover" />
                                                {formData.avatarUrl === av.url && (
                                                    <div className="absolute inset-0 bg-primary-500/10 flex items-center justify-center">
                                                        <div className="bg-primary-500 rounded-full p-0.5 shadow-sm">
                                                            <Check className="w-2.5 h-2.5 text-white font-bold" />
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}

                                        <div className="flex flex-col md:flex-row gap-4 w-full mt-2">
                                            <div className="flex-1 relative group">
                                                <Camera className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-50" />
                                                <input
                                                    type="text"
                                                    placeholder="Özel avatar URL'si girin..."
                                                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[16px] outline-none focus:border-primary-500/50 transition-all font-bold text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                                                    value={DEFAULT_AVATARS.some(a => a.url === formData.avatarUrl) ? '' : (formData.avatarUrl?.startsWith('http') ? formData.avatarUrl : '')}
                                                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                                />
                                            </div>
                                            <label className="flex items-center justify-center px-6 py-3.5 bg-primary-500/5 hover:bg-primary-500/10 text-primary-500 rounded-[16px] font-black text-[10px] cursor-pointer transition-all border border-primary-500/20 uppercase tracking-widest whitespace-nowrap">
                                                Görsel Yükle
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1 opacity-60">KULLANICI ADI</label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-50" />
                                            <input
                                                className="w-full pl-11 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[20px] outline-none focus:border-primary-500/50 transition-all font-bold text-[var(--text-main)]"
                                                value={formData.username}
                                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1 opacity-60">E-POSTA</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-50" />
                                            <input
                                                className="w-full pl-11 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[20px] outline-none focus:border-primary-500/50 transition-all font-bold text-[var(--text-main)]"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] px-1 opacity-60">YENİ ŞİFRE (OPSİYONEL)</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors opacity-50" />
                                        <input
                                            type="password"
                                            placeholder="Değiştirmek istemiyorsanız boş bırakın"
                                            className="w-full pl-11 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[20px] outline-none focus:border-primary-500/50 transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)] placeholder:opacity-30"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-black shadow-xl shadow-primary-500/20 transition-all transform active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                                >
                                    {isSaving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;
