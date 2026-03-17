import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.png';

export default function ForgotPasswordView() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call
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
        </div>
        
        <div className="z-10 space-y-8 max-w-md text-center">
           <img src={logo} alt="Logo" className="w-40 h-40 mx-auto drop-shadow-xl animate-in zoom-in duration-700" />
           <h1 className="text-5xl font-black tracking-tighter leading-tight animate-in slide-in-from-bottom duration-700">
             {t('resetPassword')}
           </h1>
           <p className="text-xl text-text-secondary font-medium leading-relaxed animate-description opacity-0" style={{ animationDelay: '200ms' }}>
             {t('forgotSubtitle')}
           </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col items-center justify-center p-8 relative bg-background">
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
                <h2 className="text-4xl font-black tracking-tight animate-in slide-in-from-bottom duration-500">{t('sendInstructions')}</h2>
                <div className="h-1.5 w-12 bg-accent rounded-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('email')}</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent transition-colors" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-card border border-accent/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all text-sm font-semibold shadow-sm"
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-accent hover:bg-accent-warm text-white py-4 rounded-2xl font-black tracking-widest flex items-center justify-center gap-3 transition-all glow active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-accent/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('sendInstructions').toUpperCase()}
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald/5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">{t('emailSent')}</h2>
                <p className="text-text-secondary font-medium">{t('emailSentDesc')}</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-accent hover:bg-accent-warm text-white py-4 rounded-2xl font-black tracking-widest transition-all glow active:scale-[0.98]"
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
