import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { Mail, Lock, User, LogIn, Chrome, Laptop, ShieldCheck, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

export default function RegisterView() {
  const { t } = useLang();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock Registration with Email Confirmation
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-text-primary overflow-hidden">
      
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col justify-center items-center p-20 bg-card relative border-r border-accent/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none overflow-hidden">
           <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent-warm/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="z-10 space-y-8 max-w-md">
           <img src={logo} alt="Logo" className="w-32 h-32 mb-8 drop-shadow-xl animate-in zoom-in duration-700" />
           <h1 className="text-6xl font-black tracking-tighter leading-tight animate-in slide-in-from-left duration-700">
             {t('createAccount')}
           </h1>
           <p className="text-xl text-text-secondary font-medium leading-relaxed animate-description opacity-0" style={{ animationDelay: '200ms' }}>
             {t('registerSubtitle')}
           </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative bg-background">
        <button 
           onClick={() => navigate('/login')}
           className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-accent font-black text-xs uppercase tracking-widest transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {t('backToLogin')}
        </button>

        <div className="w-full max-w-md space-y-10">
          {!success ? (
            <>
              <div className="space-y-3">
                <h2 className="text-4xl font-black tracking-tight text-text-primary animate-in slide-in-from-bottom duration-500">{t('createAccount')}</h2>
                <p className="text-text-secondary font-medium animate-description opacity-0" style={{ animationDelay: '100ms' }}>{t('tagline')}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-700">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('fullName')}</label>
                  <div className="relative group">
                    <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-sm font-semibold"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('email')}</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-sm font-semibold"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('password')}</label>
                    <div className="relative group">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                      <input 
                        type="password" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent text-sm font-semibold"
                        placeholder="••••"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('confirmPassword')}</label>
                    <div className="relative group">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                      <input 
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent text-sm font-semibold"
                        placeholder="••••"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-warm text-white py-4 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 transition-all glow shadow-xl shadow-accent/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      {t('registerBtn').toUpperCase()}
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-4">
                <p className="text-sm text-text-secondary font-bold">
                  {t('alreadyHaveAccount')} <button onClick={() => navigate('/login')} className="text-accent hover:underline ml-1 font-black">{t('signIn')}</button>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
               <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto ring-8 ring-accent/5">
                 <ShieldCheck className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-text-primary">{t('emailSent')}</h2>
                 <p className="text-text-secondary font-medium tracking-tight">
                   {t('emailSentDesc')}
                 </p>
               </div>
               <button 
                 onClick={() => navigate('/login')}
                 className="w-full bg-accent hover:bg-accent-warm text-white py-4 rounded-2xl font-black tracking-widest transition-all glow"
               >
                 {t('backToLogin').toUpperCase()}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
