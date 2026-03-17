import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useLang } from '../context/LangContext';
import { Mail, Lock, LogIn, Chrome, Laptop, ShieldCheck, Eye, EyeOff, Sun, Moon, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.png';

export default function LoginView() {
  const { t, theme, toggleTheme } = useLang();
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock basic login logic
    setTimeout(() => {
      if (email === 'admin@isv.com' && password === 'admin123') {
        login({ 
          name: 'Admin ISV', 
          email: 'admin@isv.com', 
          avatar: null, 
          role: 'ADMIN' 
        }, 'mock-jwt-token-' + Date.now());
      } else {
        setError(t('loginError'));
      }
      setLoading(false);
    }, 1500);
  };

  const handleSocialLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      login({ 
        name: `User ${provider}`, 
        email: `user@${provider.toLowerCase()}.com`, 
        avatar: null, 
        provider 
      }, `mock-${provider.toLowerCase()}-token`);
      setLoading(false);
    }, 1000);
  };

  const messages = [
    "Gestiona dispositivos Android con herramientas ADB de nivel profesional.",
    "Analiza el manifiesto, permisos y firmas de cualquier APK en segundos.",
    "Simula transacciones y flujos de pago de manera eficiente y segura.",
    "Genera y firma contenedores JKS con estándares de encriptación avanzados."
  ];

  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-text-primary overflow-hidden transition-colors duration-500">
      
      {/* Theme Toggle in Login */}
      <button 
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 bg-card border border-accent/10 rounded-full shadow-xl text-text-secondary hover:text-accent transition-all active:scale-95 cursor-pointer"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left side: Premium Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center p-20 bg-card relative border-r border-accent/5 overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-grid animate-grid opacity-20 pointer-events-none" />
        
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
           <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-warm/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="z-10 space-y-10 max-w-lg">
           <div className="flex items-center gap-4 animate-in zoom-in duration-700">
             <img src={logo} alt="Project Logo" className="w-24 h-24 drop-shadow-2xl " />
             <div className="h-12 w-px bg-accent/20" />
             <span className="text-xl font-black tracking-widest text-text-primary">ISV WEBKIT</span>
           </div>
           
           <div className="space-y-6">
             <h1 className="text-6xl font-black tracking-tighter leading-tight animate-in slide-in-from-left duration-700 ">
               {theme === 'light' ? 'Optimiza' : 'Revoluciona'}<br/> 
               <span className="text-accent underline decoration-accent-warm/30 underline-offset-8">
                 Tu Flujo Android
               </span>
             </h1>
             
             <div className="h-24 flex items-start">
               <p 
                key={currentMsgIndex}
                className="text-lg text-text-secondary font-medium leading-relaxed animate-reveal"
                style={{ 
                  textShadow: theme === 'dark' ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                }}
               >
                 {messages[currentMsgIndex]}
               </p>
             </div>

             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_var(--accent-color)]" />
                <span key={`typing-${currentMsgIndex}`} className="text-[10px] font-black text-accent uppercase tracking-[0.4em] typewriter-text">
                  SECURE-ISV-SESSION-INITIALIZING...
                </span>
             </div>
           </div>

           <div className="space-y-4 pt-4 animate-in fade-in duration-1000" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 text-text-secondary font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Simulador de pagos integrado</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Análisis profundo de manifiesto APK</span>
              </div>
              <div className="flex items-center gap-3 text-text-secondary font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Gestión de firmas JKS avanzada</span>
              </div>
           </div>
           
           <div className="flex gap-12 pt-10 animate-in fade-in duration-1000" style={{ animationDelay: '400ms' }}>
              <div className="flex flex-col gap-1">
                 <span className="text-4xl font-black text-accent-warm italic">100%</span>
                 <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Cloud Based</span>
              </div>
              <div className="w-px h-12 bg-accent/10" />
              <div className="flex flex-col gap-1">
                 <span className="text-4xl font-black text-accent-warm italic">Secure</span>
                 <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Encrypted JKS</span>
              </div>
           </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative bg-background">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black tracking-tight text-text-primary animate-in slide-in-from-bottom duration-500">{t('loginWelcome')}</h2>
            <p className="text-text-secondary font-medium animate-description opacity-0" style={{ animationDelay: '100ms' }}>{t('tagline')}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 animate-in fade-in duration-700" style={{ animationDelay: '200ms' }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('email')}</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-sm font-semibold shadow-sm"
                  placeholder="admin@isv.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end ml-1">
                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{t('password')}</label>
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[11px] text-accent font-black hover:underline tracking-tight cursor-pointer"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-sm font-semibold shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent transition-colors cursor-pointer p-1 rounded-full hover:bg-accent/5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-rose-500 text-xs font-bold ml-1 animate-shake">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-warm text-white py-4 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 transition-all glow active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl shadow-accent/20 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t('signIn').toUpperCase()}
                </>
              )}
            </button>
          </form>

          <div className="relative py-4 animate-in fade-in duration-700" style={{ animationDelay: '300ms' }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-accent/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-text-secondary font-black tracking-widest">{t('orContinueWith')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
            <button 
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-3 py-4 bg-card border border-accent/5 rounded-2xl hover:border-accent/20 hover:bg-accent/5 transition-all font-bold text-sm active:scale-95 shadow-sm cursor-pointer"
            >
              <Chrome className="w-5 h-5 text-rose-500" />
              <span className="font-black text-text-primary">{t('google')}</span>
            </button>
            <button 
              onClick={() => handleSocialLogin('Microsoft')}
              className="flex items-center justify-center gap-3 py-4 bg-card border border-accent/5 rounded-2xl hover:border-accent/20 hover:bg-accent/5 transition-all font-bold text-sm active:scale-95 shadow-sm cursor-pointer"
            >
              <Laptop className="w-5 h-5 text-blue-500" />
              <span className="font-black text-text-primary">{t('microsoft')}</span>
            </button>
          </div>

          <div className="text-center pt-4 animate-in fade-in duration-1000" style={{ animationDelay: '500ms' }}>
            <p className="text-sm text-text-secondary font-bold">
              {t('noAccount')} 
              <button 
                onClick={() => navigate('/register')}
                className="text-accent hover:underline ml-1 font-black underline-offset-2 cursor-pointer"
              >
                {t('createAccount')}
              </button>
            </p>
          </div>
        </div>
        
        {/* Simple Footer */}
        <div className="absolute bottom-6 text-[10px] text-text-secondary/30 font-black tracking-widest flex items-center gap-4">
           <span>ISV WEBKIT v1.0.5</span>
           <div className="w-1 h-1 bg-accent/20 rounded-full" />
           <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SECURE AUTH</span>
        </div>
      </div>
    </div>
  );
}
