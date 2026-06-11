import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Check, LayoutDashboard, BarChart2, Users, User, Building } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Preloader from '../components/Preloader';

const Register = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        tenantName: ''
    });
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setSubmitting(true);
        const API_URL = import.meta.env.VITE_API_URL || '';
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    tenantName: formData.tenantName
                })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok) {
                // Auto login after register
                localStorage.setItem('token', data.token);
                if (data.tenant_id) {
                    localStorage.setItem('tenantId', data.tenant_id);
                }
                navigate('/');
            } else {
                setError(data.message || 'Falha no cadastro. Tente novamente.');
            }
        } catch (err) {
            console.error(err);
            setError('Erro de conexão. O servidor pode estar offline.');
        } finally {
            setSubmitting(false);
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
                    <div className="w-full max-w-[1100px] min-h-[600px] lg:h-[700px] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden flex relative">

                        {/* Background Patterns */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/15 rounded-full blur-[140px]" />
                            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-400/10 rounded-full blur-[140px]" />
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
                                <div className="absolute w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />
                                
                                {/* Glass card stack */}
                                <div className="absolute w-48 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform -rotate-6 z-10"></div>
                                <div className="absolute w-48 h-32 bg-emerald-900/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transform rotate-3 z-20 flex items-center justify-center">
                                    <LayoutDashboard size={36} className="text-emerald-400/60" />
                                </div>

                                {/* Floating Cards */}
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="absolute top-0 left-0 bg-white/95 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-xl flex items-center gap-3 w-44 z-30"
                                >
                                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                                        <LayoutDashboard size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-extrabold text-[11px]">Painel Smart</p>
                                        <p className="text-emerald-600/90 text-[9px] font-semibold">Gestão Integrada</p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="absolute bottom-4 right-0 bg-white/95 backdrop-blur-md border border-white/40 p-3 rounded-2xl shadow-xl flex items-center gap-3 w-48 z-30"
                                >
                                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                        <BarChart2 size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-800 font-extrabold text-[11px]">Escala Rápida</p>
                                        <p className="text-blue-600/90 text-[9px] font-semibold">Resultados Reais</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Copy text */}
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Comece sua jornada</h2>
                                <p className="text-emerald-100/70 text-xs max-w-sm leading-relaxed">
                                    Junte-se a milhares de gestores de tráfego que escalam suas conversões e otimizam orçamentos utilizando inteligência artificial.
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Register Form */}
                        <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-10 z-10">
                            <div className="bg-white rounded-[2rem] p-8 shadow-2xl w-full max-w-[430px] relative border border-slate-100/50">
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-50/60 rounded-full blur-2xl pointer-events-none" />

                                <div className="relative z-10">
                                    <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">Crie sua conta</h1>
                                    <p className="text-slate-400 text-xs mb-6 font-medium">Preencha os dados abaixo para começar.</p>

                                    {error && (
                                        <div className="mb-5 p-3.5 bg-rose-50/80 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nome Completo</label>
                                            <div className="relative">
                                                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    placeholder="Seu nome completo"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="seu@email.com"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                            />
                                        </div>

                                        {/* Tenant/Company Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-bold text-slate-700 ml-0.5">Nome da Empresa / Agência</label>
                                            <div className="relative">
                                                <Building size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="tenantName"
                                                    placeholder="Ex: Minha Agência Digital"
                                                    required
                                                    value={formData.tenantName}
                                                    onChange={handleChange}
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        {/* Password Grid */}
                                        <div className="grid grid-cols-2 gap-3.5">
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-700 ml-0.5">Senha</label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    placeholder="******"
                                                    required
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-bold text-slate-700 ml-0.5">Confirmar</label>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    placeholder="******"
                                                    required
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300 focus:bg-white transition-all text-xs font-medium"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 text-right w-full transition-colors"
                                        >
                                            {showPassword ? 'Ocultar Senha' : 'Mostrar Senha'}
                                        </button>

                                        {/* Actions */}
                                        <div className="mt-2">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-between px-5 disabled:opacity-75 disabled:cursor-not-allowed"
                                            >
                                                <span className="text-xs tracking-wide">{submitting ? 'Criando sua conta...' : 'Registrar e Entrar'}</span>
                                                <ArrowRight size={15} />
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-6 text-center border-t border-slate-100 pt-4">
                                        <p className="text-slate-400 text-[10px] font-medium">
                                            Já tem uma conta?{' '}
                                            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4">
                                                Fazer Login
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

export default Register;
