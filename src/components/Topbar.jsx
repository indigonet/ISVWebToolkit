import { useState, useEffect } from 'react';
import { Search, Sun, Moon, Globe, Smartphone, LogOut, User, PanelLeft, XCircle, AlertCircle, Lock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from './Modal';
import { useLang } from '../context/LangContext';
import { useAppStore } from '../store/appStore';
import { api } from '../api';

export default function Topbar() {
  const { theme, toggleTheme, lang, setLang, t } = useLang();
  const [deviceSerial, setDeviceSerial] = useState(t('bsearch'));
  const inspectorApkInfo = useAppStore(state => state.inspectorApkInfo);
  const user = useAppStore(state => state.user);
  const logout = useAppStore(state => state.logout);
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
  const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
  const resetInspector = useAppStore(state => state.resetInspector);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const data = await api.getDevices();
        if (data.success && data.devices && data.devices.length > 0) {
          setDeviceSerial(data.devices[0].serial);
        } else {
          setDeviceSerial(t('none'));
        }
      } catch (e) {
        setDeviceSerial(t('disconnected'));
      }
    };
    fetchDevice();
    const interval = setInterval(fetchDevice, 5000);
    return () => clearInterval(interval);
  }, []);

  const isConnected = deviceSerial !== t('none') && deviceSerial !== t('disconnected') && deviceSerial !== t('bsearch');

  return (
    <header className="h-20 border-b border-accent/10 flex items-center justify-between px-4 lg:px-8 bg-card shadow-[0_1px_10px_rgba(0,0,0,0.02)] shrink-0 z-40 relative">
      <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`p-2 hover:bg-accent/5 rounded-xl transition-all active:scale-90 cursor-pointer ${isSidebarOpen ? 'text-accent bg-accent/5' : 'text-text-secondary'}`}
        >
          <PanelLeft className="w-4  h-4" />
        </button>

        <div className={`flex items-center gap-2 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-full border transition-all shrink-0 ${isConnected ? 'bg-emerald/5 border-emerald/20 shadow-sm shadow-emerald/5' : 'bg-rose-500/5 border-rose-500/20 shadow-sm shadow-rose-500/5'}`}>
          <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${isConnected ? 'bg-emerald animate-pulse' : 'bg-rose-500'}`} />
          <span className={`text-[10px] lg:text-sm font-black tracking-tight truncate max-w-[60px] sm:max-w-[120px] lg:max-w-none ${isConnected ? 'text-emerald' : 'text-rose-500'}`}>
            {isConnected ? deviceSerial : <><span className="sm:hidden">OFF</span><span className="hidden sm:inline">{t('disconnected')}</span></>}
          </span>
        </div>

        {inspectorApkInfo && (
          <div className="hidden sm:flex items-center gap-2 pl-4 pr-2 py-1.5 bg-accent/5 border border-accent/10 rounded-full animate-in fade-in slide-in-from-left-4 overflow-hidden max-w-[240px] lg:max-w-none group">
            <Smartphone className="w-4 h-4 text-accent shrink-0" />
            <span className="text-xs lg:text-sm font-black text-accent tracking-tight truncate max-w-[120px] lg:max-w-[200px]">
              {inspectorApkInfo.info.label || inspectorApkInfo.info.package}
            </span>
            <button 
              onClick={() => setIsConfirmOpen(true)}
              className="p-1 hover:bg-rose-500/20 text-accent hover:text-rose-500 rounded-full transition-all cursor-pointer active:scale-90 ml-1"
              title={t('removeApk')}
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        title={t('confirmAction')}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center">
             <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-text-primary uppercase tracking-tight">{t('removeApkQuestion')}</h4>
            <p className="text-text-secondary font-medium">{t('removeApkDesc')}</p>
          </div>
          <div className="flex items-center gap-4 w-full">
            <button 
              onClick={() => setIsConfirmOpen(false)}
              className="flex-1 px-6 py-4 bg-accent/5 hover:bg-accent/10 text-text-primary rounded-2xl font-black uppercase text-xs tracking-widest transition-all cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={() => {
                resetInspector();
                setIsConfirmOpen(false);
              }}
              className="flex-1 px-6 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
            >
              {t('yesRemove')}
            </button>
          </div>
        </div>
      </Modal>
      
      <div className="flex items-center gap-2 lg:gap-4 ml-auto">
        {/* Theme & Language Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 bg-accent/5 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 border border-accent/10 shadow-sm transition-all">
          <button 
            onClick={toggleTheme}
            className="p-1 hover:bg-accent/10 rounded-full transition-colors text-text-secondary hover:text-accent cursor-pointer active:scale-95"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <div className="w-px h-4 bg-accent/10 mx-1"></div>
          
          <div className="flex items-center gap-1 sm:gap-2 text-text-secondary cursor-pointer">
            <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
            <select 
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent border-none text-[10px] sm:text-sm font-black outline-none cursor-pointer hover:text-text-primary transition-colors [&>option]:bg-card [&>option]:text-text-primary focus:ring-0 p-0"
            >
              <option value="es">ES</option>
              <option value="en">EN</option>
              <option value="pt">PT</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-accent/5 sm:ml-2 group cursor-pointer select-none"
          >
             <div className="flex flex-col items-end hidden lg:flex">
                <span className="text-[11px] font-black text-text-primary uppercase tracking-tighter leading-none">{user?.name || t('guest')}</span>
                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">{user?.role || user?.provider || t('staff')}</span>
             </div>
             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center overflow-hidden hover:bg-accent/10 transition-all shadow-md active:scale-95 ring-2 ring-transparent group-hover:ring-accent/40">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                )}
             </div>
             <ChevronDown className={`w-3 h-3 text-text-secondary transition-transform duration-300 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-4 w-56 bg-card border border-accent/10 rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-accent/5 lg:hidden">
                   <p className="text-xs font-black text-text-primary truncate">{user?.name || t('guest')}</p>
                   <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{user?.role || t('staff')}</p>
                </div>
                
                <Link 
                  to="/change-password"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/5 text-text-secondary hover:text-accent transition-all group/item"
                >
                  <div className="p-2 bg-accent/5 rounded-xl group-hover/item:bg-accent/10 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{t('changePassword')}</span>
                </Link>

                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/5 text-text-secondary hover:text-rose-500 transition-all group/item cursor-pointer"
                >
                  <div className="p-2 bg-rose-500/5 rounded-xl group-hover/item:bg-rose-500/10 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest">{t('signOut')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
