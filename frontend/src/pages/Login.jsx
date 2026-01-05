import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, LayoutPanelTop } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const circle1X = useTransform(springX, (val) => val * 0.12);
    const circle1Y = useTransform(springY, (val) => val * 0.12);
    const circle2X = useTransform(springX, (val) => val * -0.08);
    const circle2Y = useTransform(springY, (val) => val * -0.08);
    const circle3X = useTransform(springX, (val) => val * 0.05);
    const circle3Y = useTransform(springY, (val) => val * -0.1);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - window.innerWidth / 2);
            mouseY.set(e.clientY - window.innerHeight / 2);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await authService.login(email, password);
            login(data.accessToken);

            if (data.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Giriş yapılamadı. Bilgilerinizi kontrol edin.';
            showToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] overflow-hidden relative selection:bg-primary-500/10">
            {/* Interactive Background Elements - Soft Pastel Version */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <motion.div
                    style={{ x: circle1X, y: circle1Y }}
                    className="absolute top-1/4 left-1/4 w-[650px] h-[650px] bg-emerald-400/30 dark:bg-emerald-500/20 rounded-full blur-[110px]"
                />
                <motion.div
                    style={{ x: circle2X, y: circle2Y }}
                    className="absolute bottom-1/4 right-1/3 w-[750px] h-[750px] bg-amber-400/25 dark:bg-amber-500/15 rounded-full blur-[130px]"
                />
                <motion.div
                    style={{ x: circle3X, y: circle3Y }}
                    className="absolute top-1/3 right-1/4 w-[550px] h-[550px] bg-rose-400/20 dark:bg-rose-500/10 rounded-full blur-[100px]"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-white/5 dark:bg-black/5 z-1" />
            </div>

            {/* Ambient Animated Border Effect Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="w-full max-w-[440px] px-4 z-10"
            >
                <div className="relative group">
                    {/* Animated Border Glow Overlay - Subtle Version */}
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-primary-400/20 via-indigo-400/20 to-primary-400/20 rounded-[33px] blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Main Glassmorphism Box - Solid Soft Version */}
                    <div className="relative bg-[var(--bg-surface)]/90 backdrop-blur-[32px] rounded-[32px] border border-[var(--border-color)] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-500">

                        <div className="p-10 pb-6 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary-500 to-indigo-600 mb-8 shadow-[0_20px_40px_rgba(14,165,233,0.3)] group-hover:scale-105 transition-transform duration-500">
                                <LayoutPanelTop className="w-10 h-10 text-white" />
                            </div>
                            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight mb-2 uppercase">Hoş Geldiniz</h1>
                        </div>

                        <div className="px-10 pb-12">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest ml-1 opacity-60">E-Posta</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within/input:text-primary-500 transition-colors opacity-50">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-12 pr-4 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/30 transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30 shadow-sm"
                                            placeholder="E-posta adresiniz..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-[var(--text-muted)] mb-2 uppercase tracking-widest ml-1 opacity-60">şifre</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)] group-focus-within/input:text-primary-500 transition-colors opacity-50">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-12 pr-12 py-4 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl outline-none focus:bg-[var(--bg-surface)] focus:border-primary-500/30 transition-all font-bold text-[var(--text-main)] placeholder:text-[var(--text-muted)]/30 shadow-sm"
                                            placeholder="Şifreniz..."
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-primary-500 transition-colors focus:outline-none opacity-50 hover:opacity-100"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full relative py-4.5 px-6 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-[0_15px_30px_rgba(14,165,233,0.25)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 mt-10 overflow-hidden group/btn"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <span className="relative z-10 tracking-[0.2em] text-[12px] uppercase">Giriş Yap</span>
                                    )}
                                </button>
                            </form>


                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
