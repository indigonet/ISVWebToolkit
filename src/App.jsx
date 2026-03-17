import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { Terminal, Trash2 } from 'lucide-react';
import { LangProvider, useLang } from './context/LangContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SimulatorView from './views/SimulatorView';
import ADBView from './views/ADBView';
import InspectorView from './views/InspectorView';
import SignerView from './views/SignerView';
import LogcatView from './views/LogcatView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import ForgotPasswordView from './views/ForgotPasswordView';
import SettingsView from './views/SettingsView';
import ChangePasswordView from './views/ChangePasswordView';

function AppLayout() {
  const { t } = useLang();
  const installingMessage = useAppStore(state => state.installingMessage);
  const installProgress = useAppStore(state => state.installProgress);
  const showLogs = useAppStore(state => state.showLogs);
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen);

  const [logs, setLogs] = React.useState([
  ]);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('es-CL', { hour12: false });
    setLogs(prev => [...prev, { id: Date.now(), type, time, msg }]);
  };

  return (
    <div className="flex h-screen bg-background text-text-primary font-sans overflow-hidden">
      {/* Sidebar with Desktop/Mobile Logic handled inside Sidebar component or here */}
      <Sidebar />

      <main className={`flex-1 flex flex-col min-w-0 h-screen bg-background transition-all duration-300 ${isSidebarOpen ? 'lg:pl-0' : 'pl-0'}`}>
        <Topbar />

        {/* Workspace Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
          <Routes>
            <Route path="/" element={<Navigate to="/inspector" replace />} />
            <Route path="/simulator" element={<SimulatorView onLog={addLog} />} />
            <Route path="/adb" element={<ADBView onLog={addLog} />} />
            <Route path="/logcat" element={<LogcatView onLog={addLog} />} />
            <Route path="/inspector" element={<InspectorView onLog={addLog} />} />
            <Route path="/signer" element={<SignerView onLog={addLog} />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/change-password" element={<ChangePasswordView />} />
            <Route path="*" element={<div className="flex justify-center items-center h-full text-text-secondary">Page not found</div>} />
          </Routes>

          {/* Global Install/Uninstall Notification - Floating in Workspace */}
          {installingMessage && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-500 w-[340px]">
               <div className="px-6 py-4 bg-card border border-accent/10 rounded-[2rem] flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] backdrop-blur-xl bg-card/90">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                       <div className="w-3 h-3 rounded-full bg-accent animate-ping" />
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-[10px] font-black text-accent uppercase tracking-widest">{installProgress === 100 ? 'Completado' : 'Procesando...'}</span>
                       <span className="text-sm font-black text-text-primary truncate leading-tight">{installingMessage}</span>
                    </div>
                  </div>
                  {installProgress !== null && (
                    <div className="w-full bg-accent/5 h-2 rounded-full overflow-hidden border border-accent/5">
                       <div 
                         className="h-full bg-accent rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                         style={{ width: `${installProgress}%` }}
                       />
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        {/* Terminal Area - Controlled by showLogs */}
        <footer className={`border-t border-accent/5 bg-card flex flex-col shrink-0 relative transition-all duration-300 overflow-hidden ${showLogs ? 'h-64 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]' : 'h-0 border-none'}`}>
          <div className="flex items-center justify-between px-6 py-2 border-b border-accent/5 bg-accent/5">
            <div className="flex items-center gap-2 text-xs font-black text-text-secondary tracking-widest uppercase">
              <Terminal className="w-4 h-4 text-accent" />
              {t('systemLogs')}
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-[10px] text-text-secondary hover:text-accent flex items-center gap-1 uppercase tracking-widest transition-colors cursor-pointer active:scale-95 px-2 py-1 rounded hover:bg-accent/5 font-black"
            >
              <Trash2 className="w-3 h-3" /> {t('clear')}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-xs space-y-1.5 custom-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="flex gap-4 group">
                <span className="text-text-secondary/60 whitespace-nowrap font-bold">[{log.time}]</span>
                <span className={`font-semibold tracking-tight
                  ${log.type === 'error' ? 'text-rose-500' : ''}
                  ${log.type === 'success' ? 'text-emerald-600' : ''}
                  ${log.type === 'info' ? 'text-text-primary' : ''}
                  ${log.type === 'warning' ? 'text-amber-600' : ''}
                `}>
                  {log.msg}
                </span>
              </div>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}

const AppWrapper = () => {
  const isAuthenticated = useAppStore(state => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginView /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterView /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPasswordView /> : <Navigate to="/" />} />
      <Route 
        path="*" 
        element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AppWrapper />
      </LangProvider>
    </BrowserRouter>
  );
}
