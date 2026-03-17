import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function ChangePasswordView() {
  const { t } = useLang();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock update logic
    setTimeout(() => {
      setLoading(false);
      alert(t('passwordChanged') || 'Contraseña cambiada con éxito');
    }, 1500);
  };

  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-20 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/50 backdrop-blur-xl border border-accent/10 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <ShieldCheck className="w-32 h-32 text-accent" />
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex p-3 bg-accent/10 rounded-2xl text-accent">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">{t('changePassword')}</h2>
            <p className="text-text-secondary font-medium italic opacity-70">{t('passwordSecurityDesc')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">{t('currentPassword')}</label>
              <div className="relative group">
                <input 
                  type={showCurrent ? "text" : "password"} 
                  required
                  className="w-full bg-accent/5 border border-accent/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-text-secondary/30 transition-all"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent cursor-pointer p-1 rounded-lg transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">{t('newPassword')}</label>
                <div className="relative group">
                  <input 
                    type={showNew ? "text" : "password"} 
                    required
                    className="w-full bg-accent/5 border border-accent/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-text-secondary/30 transition-all"
                    placeholder="••••••••"
                  />
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                  <button 
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent cursor-pointer p-1 rounded-lg transition-colors"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-accent uppercase tracking-widest pl-2">{t('confirmNewPassword')}</label>
                <div className="relative group">
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    required
                    className="w-full bg-accent/5 border border-accent/10 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-text-secondary/30 transition-all"
                    placeholder="••••••••"
                  />
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                  <button 
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent cursor-pointer p-1 rounded-lg transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent-warm text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer overflow-hidden relative group"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {t('updatePassword')}
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[10px] font-bold text-text-secondary/40 uppercase tracking-[0.2em] leading-relaxed">
            {t('passwordLogoutDesc')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
