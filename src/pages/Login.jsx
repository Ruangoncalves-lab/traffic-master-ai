import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check, LayoutDashboard, BarChart2, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Preloader from '../components/Preloader';

const Login = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        // setIsLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || '';
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                localStorage.setItem('token', data.token);
                if (data.tenant_id) {
                    localStorage.setItem('tenantId', data.tenant_id);
                }
                navigate('/');
            } else {
                setError(data.message || 'Falha no login. Verifique suas credenciais ou o servidor.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro de conexão. O servidor pode estar offline.');
        }
    };

    return (
        <>
            <AnimatePresence>
                {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
            </AnimatePresence>

            {!isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50 flex items-center justify-center p-4 font-sans relative overflow-hidden"
                >
                    {/* Background Ambient Orbs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none" />

                    {/* Main Container */}
                    <div className="w-full max-w-[1100px] min-h-[500px] lg:h-[600px] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex relative">

                        {/* Background Patterns */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/15 rounded-full blur-[140px]" />
                            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-400/10 rounded-full blur-[140px]" />
                            {/* Grid Pattern Overlay */}
                            <div className="absolute inset-0 opacity-[0.04]"
                                style={{ backgroundImage: 'radial-gradient(#fff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
                            />
                        </div>

                        {/* Left Side - Illustration & Branding */}
                        <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-10 z-10">
                            {/* Logo */}
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
                                    <span className="text-xl font-extrabold tracking-tight text-emerald-400">T</span>
                                </div>
                                <span className="text-xl font-extrabold text-white tracking-tight">Traffic<span className="text-emerald-400">Master</span></span>
                            </div>

                            {/* Central Illustration Area */}
                            <div className="relative w-full max-w-sm mx-auto h-64 flex items-center justify-center">
                                {/* Abstract Circle/Glow behind */}
                                <div className="absolute w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />

                                {/* Glass card stack */}
                                <div className="absolute w-48 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform -rotate-6 z-10"></div>
                                <div className="absolute w-48 h-32 bg-emerald-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform rotate-3 z-20 flex items-center justify-center">
                                    <LayoutDashboard size={36} className="text-emerald-400/60" />
                                </div>

                                {/* Floating Feature Cards */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0, y: 0 }}
                                    animate={{ x: 0, opacity: 1, y: [0, -8, 0] }}
                                    transition={{
                                        x: { duration: 0.8, delay: 0.2 },
                                        opacity: { duration: 0.8, delay: 0.2 },
                                        y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }
                                    }}
                                    className="absolute top-0 left-0 bg-white/95 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-xl flex items-center gap-3 w-44 z-30"
                                >
                                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                        <LayoutDashboard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-extrabold text-[11px]">Painel Smart</p>
                                        <p className="text-emerald-600/90 text-[9px] font-semibold">Otimização Ativa</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0, y: 0 }}
                                    animate={{ x: 0, opacity: 1, y: [0, -10, 0] }}
                                    transition={{
                                        x: { duration: 0.8, delay: 0.4 },
                                        opacity: { duration: 0.8, delay: 0.4 },
                                        y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.7 }
                                    }}
                                    className="absolute bottom-4 right-0 bg-white/95 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-xl flex items-center gap-3 w-48 z-30"
                                >
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <BarChart2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-extrabold text-[11px]">Dados em Tempo Real</p>
                                        <p className="text-blue-600/90 text-[9px] font-semibold">Métricas de Tráfego</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: [20, 10, 20], opacity: 1 }}
                                    transition={{
                                        opacity: { duration: 0.8, delay: 0.6 },
                                        y: {
                                            opacity: { duration: 0.8 },
                                            repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.9
                                        }
                                    }}
                                    className="absolute top-12 right-[-20px] bg-white/95 backdrop-blur-md border border-white/40 p-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 z-20"
                                >
                                    <div className="p-1.5 bg-orange-50 rounded-xl text-orange-600">
                                        <Users size={12} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-extrabold text-[10px]">Time Integrado</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Bottom Text */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Domine seu tráfego pago</h2>
                                <p className="text-emerald-100/70 text-xs max-w-sm leading-relaxed">
                                    Acompanhe todas as suas campanhas de anúncios, leads e métricas de conversão em tempo real com Inteligência Artificial.
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Floating Login Form */}
                        <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-10 z-10">
                            <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-[390px] relative border border-slate-100/50">
                                {/* Decorative top-right circle inside card */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none" />

                                <div className="relative z-10">
                                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">Bem-vindo de volta!</h1>
                                    <p className="text-slate-400 text-xs mb-6 font-medium">Por favor, insira seus dados para entrar.</p>

                                    {error && (
                                        <div className="mb-5 p-3.5 bg-rose-50/80 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleLogin} className="flex flex-col gap-4.5">
                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Email</label>
                                            <input
                                                type="email"
                                                placeholder="Digite seu email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Senha</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="**************"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="flex items-center gap-2.5 my-1">
                                            <div className="relative flex items-center">
                                                <input type="checkbox" className="peer h-4 w-4 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-emerald-500 checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                                                <Check size={10} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Ao entrar, você concorda com nossos <a href="#" className="text-emerald-600 font-bold hover:underline">Termos & Condições</a>
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-3.5 mt-2">
                                            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-between px-5">
                                                <span className="text-xs tracking-wide">Entrar no Painel</span>
                                                <ArrowRight size={15} />
                                            </button>

                                            <div className="flex justify-center">
                                                <Link to="/forgot-password" className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                                                    Esqueceu a senha?
                                                </Link>
                                            </div>
                                        </div>
                                    </form>

                                    <div className="mt-6 text-center border-t border-slate-100 pt-4">
                                        <p className="text-slate-400 text-[10px] font-medium">
                                            Não tem uma conta?{' '}
                                            <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4">
                                                Criar Conta
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </>
    );
};

export default Login;
