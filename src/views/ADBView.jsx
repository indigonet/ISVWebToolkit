import React, { useState } from 'react';
import { Terminal, Zap, MonitorSmartphone, RefreshCw, Trash2 } from 'lucide-react';
import { useLang } from '../context/LangContext';
import { api } from '../api';

const ADB_COMMANDS = [
  { id: 'devices', name: 'List Devices', icon: MonitorSmartphone },
  { id: 'install', name: 'Install APK', icon: Zap }
];

export default function ADBView({ onLog }) {
  const { t } = useLang();
  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleInstall = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    onLog(`Installing ${file.name} to device...`, 'info');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await api.installApk(file);
      if (data.success) {
        onLog(`Successfully installed ${file.name}. Output: ${data.output}`, 'success');
      } else {
        onLog(`Install failed: ${data.error}`, 'error');
      }
    } catch (err) {
      onLog(`Install network error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCommandClick = (id) => {
    setActiveTool(id);
    if (id === 'devices') {
      onLog('Fetching devices...', 'info');
      api.getDevices()
        .then(data => onLog(`ADB Devices:\n${data.output}`, 'success'))
        .catch(e => onLog('Error getting devices: ' + e.message, 'error'));
    }
  };

  return (
    <div 
      className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ADB_COMMANDS.map(cmd => (
          <button 
            key={cmd.id} 
            onClick={() => handleCommandClick(cmd.id)}
            className={`p-6 bg-card border ${activeTool === cmd.id ? 'border-accent shadow-md glow' : 'border-accent/5'} rounded-3xl hover:border-accent/50 transition-all group relative cursor-pointer active:scale-[0.98]`}
          >
            {cmd.id === 'install' && (
              <input type="file" accept=".apk" onChange={handleInstall} className="absolute inset-0 opacity-0 cursor-pointer" title="Select APK file to install"/>
            )}
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
              <cmd.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-left mb-1 text-text-primary">{t(cmd.id === 'devices' ? 'adbTools' : 'installApk')}</h3>
            {cmd.id === 'install' && <p className="text-xs text-text-secondary text-left">{t('selectApkFile')}</p>}
          </button>
        ))}
      </div>
    </div>
  );
}
