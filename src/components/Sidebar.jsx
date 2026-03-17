import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FilePen, 
  Smartphone, 
  Settings, 
  PawPrint, 
  ChevronRight,
  FileSearch,
  TerminalSquare,
  MonitorCloud,
  Zap,
  X,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAppStore } from '../store/appStore';
import logo from '../assets/logo.png';

const NavItem = ({ to, icon: Icon, label, onClick, isCollapsed }) => {
  return (
    <NavLink 
      to={to}
      onClick={onClick}
      className={({ isActive }) => `
        w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer overflow-hidden
        ${isActive ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-text-secondary hover:bg-accent/5 hover:text-accent'}
      `}
    >
      {({ isActive }) => (
        <>
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
          <span className={`font-medium transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'opacity-0 scale-95 w-0' : 'opacity-100 scale-100'}`}>{label}</span>
          {!isCollapsed && isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
        </>
      )}
    </NavLink>
  );
};

export default function Sidebar() {
  const { t } = useLang();
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
  const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
  const showLogs = useAppStore(state => state.showLogs);
  const setShowLogs = useAppStore(state => state.setShowLogs);


  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col bg-card shrink-0 border-r border-accent/5
        transition-all duration-300 ease-in-out
        ${isSidebarOpen 
          ? 'w-64 translate-x-0' 
          : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'
        }
      `}>
        
        <div className="p-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-accent/5 rounded-xl flex items-center justify-center p-2 ring-1 ring-accent/10 shadow-lg shadow-accent/5 shrink-0">
             <img src={logo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className={`text-xs font-black text-text-primary tracking-tight uppercase truncate transition-all duration-300 ${!isSidebarOpen && 'opacity-0 scale-95 w-0'}`}>
            ISV Web Toolkit
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem to="/inspector" icon={FileSearch} label={t('inspector')} isCollapsed={!isSidebarOpen} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem to="/simulator" icon={MonitorCloud} label={t('simulator')} isCollapsed={!isSidebarOpen} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem to="/signer" icon={FilePen} label={t('signer')} isCollapsed={!isSidebarOpen} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
          <NavItem to="/logcat" icon={PawPrint} label={'Logcat'} isCollapsed={!isSidebarOpen} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </nav>

        <div className="p-3 border-t border-accent/5 space-y-1.5">
          <button 
            onClick={() => setShowLogs(!showLogs)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer overflow-hidden
              ${showLogs ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:bg-accent/5 hover:text-accent'}
            `}
          >
            <TerminalSquare className={`w-5 h-5 shrink-0 ${showLogs ? 'animate-pulse' : ''}`} />
            <span className={`font-medium transition-all duration-300 whitespace-nowrap ${!isSidebarOpen ? 'opacity-0 scale-95 w-0' : 'opacity-100 scale-100'}`}>
              {t('Registros') || 'Registros'}
            </span>
          </button>

          <NavItem to="/settings" icon={Settings} label={t('settings')} isCollapsed={!isSidebarOpen} onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)} />
        </div>
      </aside>
    </>
  );
}
