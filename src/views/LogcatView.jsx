import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Terminal, RefreshCw, Trash2, Download, Filter, Play, Square, Search } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useLang } from '../context/LangContext';
import { api } from '../api';

export default function LogcatView({ onLog }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [filterInput, setFilterInput] = useState('');
  const [minLevel, setMinLevel] = useState('V');
  const streamIntervalRef = useRef(null);
  const logRef = useRef(null);
  
  const apkInfo = useAppStore(state => state.inspectorApkInfo);
  const logcatData = useAppStore(state => state.adbLogcatData);
  const setLogcatData = useAppStore(state => state.setAdbLogcatData);

  const levels = {
    'V': { rank: 0, label: 'VERBOSE', color: 'text-text-secondary/60' },
    'D': { rank: 1, label: 'DEBUG', color: 'text-emerald-400' },
    'I': { rank: 2, label: 'INFO', color: 'text-sky-400' },
    'W': { rank: 3, label: 'WARN', color: 'text-amber-400' },
    'E': { rank: 4, label: 'ERROR', color: 'text-rose-400' }
  };

  const fetchLogcat = async (isAuto = false) => {
    if (!isAuto) setLoading(true);
    try {
      const data = await api.getLogcat(2000, selectedPackage || null);
      if (data.success) {
        if (data.output !== logcatData) {
          setLogcatData(data.output);
        }
        if (!isAuto) onLog('Logcat sincronizado', 'success');
      }
    } catch (e) {
      if (!isAuto) onLog('Error: ' + e.message, 'error');
    } finally {
      if (!isAuto) setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const data = await api.getPackages();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleClear = () => {
    setLogcatData('');
    onLog('Logcat limpiado', 'info');
  };

  const toggleStreaming = () => {
    if (isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  };

  const startStreaming = () => {
    if (streamIntervalRef.current) return;
    setIsStreaming(true);
    fetchLogcat(true);
    streamIntervalRef.current = setInterval(() => {
      fetchLogcat(true);
    }, 2000);
    onLog('Streaming Logcat activado', 'info');
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    onLog('Streaming Logcat detenido', 'info');
  };

  const downloadLogcat = () => {
    if (!logcatData) return;
    const blob = new Blob([logcatData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const appName = apkInfo?.info?.label?.replace(/\s+/g, '_') || 'General';
    const pkgName = selectedPackage ? selectedPackage.split('.').pop() : 'all';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    a.href = url;
    a.download = `ISV_Toolkit_${appName}_${pkgName}_${timestamp}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onLog('Logcat exportado correctamente', 'success');
  };

  // Debounced Filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedPackage(filterInput);
    }, 600);
    return () => clearTimeout(timer);
  }, [filterInput]);

  useEffect(() => {
    fetchPackages();
    // fetchLogcat() removido para evitar carga automática al recargar la página.
    // El usuario debe iniciar manualmente con START o REFRESH.
    return () => stopStreaming();
  }, []);

  useEffect(() => {
    if (logRef.current && logcatData) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logcatData]);

  useEffect(() => {
    fetchLogcat(isStreaming);
  }, [selectedPackage]);

  const renderedLines = useMemo(() => {
    if (!logcatData) return null;
    
    const minRank = levels[minLevel].rank;
    
    return logcatData.split('\n').map((line, idx) => {
      if (!line.trim()) return null;
      
      let level = 'V';
      if (line.includes(' E ') || line.includes('E/')) level = 'E';
      else if (line.includes(' W ') || line.includes('W/')) level = 'W';
      else if (line.includes(' I ') || line.includes('I/')) level = 'I';
      else if (line.includes(' D ') || line.includes('D/')) level = 'D';

      if (levels[level].rank < minRank) return null;

      const lvlInfo = levels[level];
      const colorClass = lvlInfo.color;
      let bgClass = "";
      
      if (level === 'E') bgClass = "bg-rose-500/5";
      else if (level === 'W') bgClass = "bg-amber-500/5";

      return (
        <div key={idx} className={`px-2 py-0.5 border-l-2 border-transparent hover:border-accent/40 hover:bg-white/5 transition-all ${bgClass} ${colorClass} whitespace-pre-wrap break-all min-h-[1.2rem]`}>
          <span className="opacity-20 mr-2 text-[9px] select-none inline-block w-8 font-mono">{idx + 1}</span>
          <span className="opacity-40 mr-2 font-black text-[9px] w-4 inline-block">{level}</span>
          {line}
        </div>
      );
    });
  }, [logcatData, minLevel]);

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden pb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-text-primary flex items-center gap-3">
          <Terminal className="w-6 h-6 text-accent" /> 
          {t('logcatViewer') || 'Visor Logcat'}
          {isStreaming && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </h2>
        
        <div className="flex flex-wrap items-center gap-2">
           <div className="flex items-center gap-2 flex-1 lg:flex-none lg:w-[450px]">
             <div className="relative group/search flex-1">
               <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 group-focus-within/search:text-accent transition-colors" />
               <input 
                  list="package-list"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  autoComplete="off"
                  placeholder="Filtrar paquete..."
                  className="w-full pl-10 pr-4 py-2.5 bg-card border border-accent/10 rounded-xl text-[11px] text-text-primary font-bold hover:border-accent/40 focus:border-accent transition-all outline-none shadow-sm"
               />
               <datalist id="package-list">
                  {packages.map(p => <option key={p} value={p} />)}
               </datalist>
             </div>

             <div className="relative group/level w-32">
               <Filter className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2 group-focus-within/level:text-accent transition-colors pointer-events-none" />
               <select 
                  value={minLevel}
                  onChange={(e) => setMinLevel(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 bg-card border border-accent/10 rounded-xl text-[11px] text-text-primary font-black hover:border-accent/40 focus:border-accent transition-all outline-none appearance-none cursor-pointer shadow-sm uppercase tracking-tighter"
               >
                  {Object.entries(levels).map(([code, info]) => (
                    <option key={code} value={code} className="bg-card text-text-primary">{info.label}</option>
                  ))}
               </select>
             </div>
           </div>
           
           <button 
             onClick={toggleStreaming} 
             className={`px-5 py-2.5 rounded-xl text-[10px] font-black flex flex-row items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg border-2 ${
               isStreaming 
               ? 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20' 
               : 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20'
             }`}
           >
             {isStreaming ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
             {isStreaming ? 'STOP LOGCAT' : 'START LOGCAT'}
           </button>

           <div className="flex items-center bg-card border border-accent/10 rounded-xl p-1 shadow-sm">
             <button onClick={downloadLogcat} title="Descargar Log" disabled={!logcatData} className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-all cursor-pointer disabled:opacity-30">
               <Download className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-accent/10 mx-1" />
             <button onClick={() => fetchLogcat()} title="Refrescar" disabled={loading || isStreaming} className="p-2 text-text-secondary hover:text-accent hover:bg-accent/5 rounded-lg transition-all cursor-pointer disabled:opacity-30">
               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-accent' : ''}`} />
             </button>
           </div>
           
           <button onClick={handleClear} className="px-4 py-2.5 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/10 rounded-xl text-[10px] font-black flex flex-row items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm uppercase tracking-widest">
             <Trash2 className="w-4 h-4" /> LIMPIAR
           </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0a0a0c] rounded-2xl border border-accent/20 overflow-hidden shadow-2xl flex flex-col relative group/terminal">
         <div className="bg-white/5 border-b border-white/5 px-4 py-2 flex items-center justify-between">
           <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
             <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
           </div>
           <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-[0.2em]">ADB LIVE OUTPUT</span>
         </div>

         <div 
           ref={logRef}
           className="flex-1 p-0.5 font-mono text-[11px] overflow-auto custom-scrollbar-dark leading-snug scroll-smooth bg-transparent select-text"
         >
            <div className="p-3">
              {logcatData ? renderedLines : (
                 <div className="h-[400px] flex flex-col items-center justify-center text-text-secondary/20 italic gap-4">
                    <div className="p-6 bg-white/5 rounded-full">
                      <Terminal className="w-12 h-12 opacity-40" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-black uppercase tracking-widest text-[10px] opacity-40">Ready to trace</p>
                      <p className="text-[9px] opacity-20">Pulsa START o REFRESH para capturar datos</p>
                    </div>
                 </div>
              )}
            </div>
         </div>
         
         <div className="absolute bottom-4 right-6 pointer-events-none transition-opacity duration-300 group-hover/terminal:opacity-0">
            <div className="flex items-center gap-2 bg-accent px-3 py-1 rounded-full shadow-2xl">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-wider">Scroll Live</span>
            </div>
         </div>
      </div>
    </div>
  );
}
