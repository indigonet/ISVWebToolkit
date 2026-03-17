import React, { useState, useEffect } from 'react';
import { RefreshCw, FileSearch, Eye, Smartphone, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Zap, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useLang } from '../context/LangContext';
import { api } from '../api';
import Modal from '../components/Modal';
import { blobStorage } from '../utils/db';

export default function InspectorView({ onLog }) {
  const { t } = useLang();
  const [analyzing, setAnalyzing] = useState(false);
  
  // Zustand State
  const apkInfo = useAppStore(state => state.inspectorApkInfo);
  const setApkInfo = useAppStore(state => state.setInspectorApkInfo);
  const apkFile = useAppStore(state => state.apkFile);
  const setApkFile = useAppStore(state => state.setApkFile);
  const isInstalled = useAppStore(state => state.isInstalled);
  const setIsInstalled = useAppStore(state => state.setIsInstalled);
  const setInstallingMessage = useAppStore(state => state.setInstallingMessage);
  const setInstallProgress = useAppStore(state => state.setInstallProgress);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Recovery from IndexedDB on refresh/login
  useEffect(() => {
    const recoverFile = async () => {
      if (!apkFile && apkInfo?.info?.package) {
        try {
          const storedBlob = await blobStorage.get(apkInfo.info.package);
          if (storedBlob) {
            // Convert blob back to File for better compatibility
            const file = new File([storedBlob], `${apkInfo.info.label || 'app'}.apk`, { type: 'application/vnd.android.package-archive' });
            setApkFile(file);
          }
        } catch (e) {
          console.error("Failed to recover APK from IndexedDB", e);
        }
      }
    };
    recoverFile();
  }, [apkInfo]);

  const checkIfInstalled = async (pkgName) => {
    if (!pkgName) return;
    try {
      const data = await api.getPackages();
      const pkgList = data.packages || [];
      const installed = pkgList.some(p => p === pkgName || (p && p.package === pkgName));
      setIsInstalled(installed);
    } catch (error) {
      console.error("Error checking if app is installed:", error);
    }
  };

  // Initial check if we have persisted info
  useEffect(() => {
    if (apkInfo?.info?.package) {
      checkIfInstalled(apkInfo.info.package);
    }
  }, [apkInfo]);

  const handleFileUpload = async (e) => {
    const file = e?.target?.files?.[0] || e; // Support both event and direct file
    if (!(file instanceof File)) return;

    setAnalyzing(true);
    onLog(`${t('readingApk')} ${file.name}...`, 'info');

    try {
      const data = await api.analyzeApk(file);
      if (data.success) {
        setApkInfo(data);
        setApkFile(file);
        
        // Persistir binario en IndexedDB para que sobreviva recargas/login
        await blobStorage.save(data.info.package, file);
        
        checkIfInstalled(data.info.package);
        onLog(`Successfully analyzed ${file.name}`, 'success');
      } else {
        onLog(`Analysis failed: ${data.error || 'Check console for details'}`, 'error');
      }
    } catch (error) {
      onLog(`Error analyzing APK: ${error.message}`, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleInstallApk = async () => {
    if (!apkFile) {
       onLog('No file pointer available. Please re-analyze the APK to install it.', 'error');
       return;
    }

    const appLabel = apkInfo?.info?.label || apkFile.name;
    setInstallingMessage(`Instalando ${appLabel}...`, 0);
    onLog(`Instalando ${appLabel} en el dispositivo...`, 'info');
    
    const progressInterval = setInterval(() => {
       useAppStore.setState(state => ({
           installProgress: state.installProgress >= 90 ? 90 : state.installProgress + (Math.random() * 10 + 2)
       }));
    }, 800);

    try {
      const data = await api.installApk(apkFile);
      clearInterval(progressInterval);
      setInstallProgress(100);
      
      setTimeout(() => {
        if (data.success) {
          onLog(`Successfully installed ${appLabel}.`, 'success');
          checkIfInstalled(apkInfo.info.package);
        } else {
          onLog(`Install failed: ${data.error}`, 'error');
        }
        setInstallingMessage(null, null);
      }, 1000);

    } catch (err) {
      clearInterval(progressInterval);
      onLog(`Install network error: ${err.message}`, 'error');
      setInstallingMessage(null, null);
    }
  };

  const handleUninstall = async () => {
    if (!apkInfo?.info?.package) return;
    const pkg = apkInfo.info.package;
    const appLabel = apkInfo?.info?.label || pkg;

    setInstallingMessage(`Desinstalando ${appLabel}...`, 0);
    onLog(`Desinstalando ${appLabel}...`, 'info');

    const progressInterval = setInterval(() => {
       useAppStore.setState(state => ({
           installProgress: state.installProgress >= 90 ? 90 : state.installProgress + 15
       }));
    }, 400);

    try {
      const data = await api.uninstallApk(pkg);
      clearInterval(progressInterval);
      setInstallProgress(100);

      setTimeout(() => {
        if (data.success) {
          onLog(`Successfully uninstalled ${appLabel}`, 'success');
          setIsInstalled(false);
        } else {
          onLog(`Uninstall failed: ${data.error}`, 'error');
        }
        setInstallingMessage(null, null);
      }, 1000);
    } catch (err) {
      clearInterval(progressInterval);
      onLog(`Uninstall network error: ${err.message}`, 'error');
      setInstallingMessage(null, null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">{t('apkInspector')}</h2>
        <div className="flex w-full sm:w-auto">
          <label className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent-warm text-white rounded-2xl transition-all shadow-xl shadow-accent/20 cursor-pointer font-black flex items-center justify-center gap-2 active:scale-95 text-xs uppercase tracking-widest">
            <FileSearch className="w-4 h-4" />
            {t('selectApk')}
            <input type="file" accept=".apk" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {analyzing && (
        <div className="p-12 bg-card rounded-3xl border border-accent/10 flex flex-col items-center justify-center gap-4 animate-pulse">
          <RefreshCw className="w-12 h-12 text-accent animate-spin" />
          <p className="text-text-secondary font-black uppercase tracking-widest text-xs">{t('readingApk')}</p>
        </div>
      )}

      {!analyzing && !apkInfo && (
        <div className="p-20 border-2 border-dashed border-accent/10 rounded-[2.5rem] bg-accent/5 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-8">
            <Eye className="w-12 h-12 text-accent opacity-50" />
          </div>
          <h2 className="text-3xl font-black mb-3 text-text-primary tracking-tight uppercase">{t('readyInspect')}</h2>
          <p className="text-text-secondary mb-8 max-w-sm font-medium">{t('uploadApkDesc')}</p>
        </div>
      )}

      {apkInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (9/12) */}
          <div className="lg:col-span-9 space-y-4">
            {/* App Info Card */}
            <div className="p-5 bg-card rounded-3xl border border-accent/5 shadow-sm space-y-6 animate-in zoom-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="relative group/icon shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-accent/5 rounded-2xl flex items-center justify-center p-2.5 ring-1 ring-accent/10 shadow-xl shadow-accent/20 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden">
                      {apkInfo.info.iconBase64 ? (
                         <img 
                           src={`data:image/png;base64,${apkInfo.info.iconBase64}`} 
                           alt="App Icon" 
                           className="w-full h-full object-contain drop-shadow-2xl brightness-110 relative z-10"
                           loading="eager"
                           onError={(e) => {
                             e.target.style.display = 'none';
                             const fallback = e.target.parentElement.querySelector('.fallback-icon');
                             if(fallback) fallback.style.display = 'block';
                           }}
                         />
                      ) : null}
                      <Smartphone 
                        className={`w-8 h-8 sm:w-10 sm:h-10 text-accent/20 fallback-icon absolute inset-0 m-auto ${apkInfo.info.iconBase64 ? 'hidden' : 'block'}`} 
                      />
                    </div>
                    {/* Option to re-scan/refresh specifically if icon is missing */}
                    <button 
                      onClick={() => handleFileUpload(apkFile)}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/icon:opacity-100 transition-opacity hover:scale-110 active:scale-90 cursor-pointer z-20"
                      title="Re-fetch icon"
                    >
                      <RefreshCw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-text-primary tracking-tighter leading-tight truncate">{apkInfo.info.label || t('unknownApp')}</h3>
                    <p className="text-text-secondary font-bold text-[10px] sm:text-[12px] opacity-90 font-mono tracking-tight truncate">{apkInfo.info.package}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isInstalled ? (
                    <button 
                      onClick={handleUninstall} 
                      className="flex-1 px-4 sm:px-6 py-2.5 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-rose-500/10 uppercase tracking-widest whitespace-nowrap"
                    >
                      <Trash2 className="w-3 h-3" />
                      {t('uninstall') || 'Desinstalar'}
                    </button>
                  ) : (
                    <button 
                      onClick={apkFile ? handleInstallApk : () => onLog(t('reselectApkPrompt') || 'Por favor, vuelve a seleccionar el archivo APK para instalarlo.', 'warning')} 
                      className="flex-1 px-4 sm:px-6 py-2.5 bg-emerald-500/5 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-500/10 uppercase tracking-widest whitespace-nowrap"
                    >
                      <Zap className="w-3 h-3" />
                      {t('installApk')}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-5 border-t border-accent/5">
                <InfoStat label={t('versionName')} value={apkInfo.info.versionName} />
                <InfoStat label={t('versionCode')} value={apkInfo.info.versionCode} />
                <InfoStat label={t('minSdk')} value={apkInfo.info.sdkVersion} />
                <InfoStat label={t('targetSdk')} value={apkInfo.info.targetSdkVersion} />
                <InfoStat label={t('debuggable')} value={apkInfo.info.debuggable ? t('yes') : t('no')} accent={apkInfo.info.debuggable} />
              </div>
            </div>

            {/* Signature Block */}
            <div className="p-6 bg-card rounded-3xl border border-accent/5 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" /> {t('signatureVerif')}
              </h3>

              {apkInfo.structuredSig ? (
                <div className="space-y-4">
                  <div className="bg-accent/5 p-3 rounded-2xl border border-accent/10 transition-colors flex items-center gap-2">
                    {apkInfo.structuredSig.valid ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shadow-emerald-500/20 shadow-lg" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-500 shadow-rose-500/20 shadow-lg" />
                    )}
                    <span className="text-text-primary break-all flex-1 leading-relaxed opacity-90 font-bold uppercase">
                      {apkInfo.structuredSig.valid ? t('signatureValid') : t('signatureInvalid')}: 
                      <span className="ml-2 text-accent transition-all">
                       {[
                         apkInfo.structuredSig.v1 && 'V1',
                         apkInfo.structuredSig.v2 && 'V2',
                         apkInfo.structuredSig.v3 && 'V3',
                         apkInfo.structuredSig.v4 && 'V4'
                       ].filter(Boolean).join(', ')}
                      </span>
                    </span>
                  </div>
                 
                  <div className="text-[11px] space-y-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-black min-w-[100px] flex items-center uppercase tracking-widest leading-relaxed">📜 {t('certificate')}:</span>
                      <span className="font-mono text-text-secondary break-all flex-1 leading-relaxed  font-bold">{apkInfo.structuredSig.certificate}</span>
                    </div>
                    <div className="flex items-center pt-2 border-t border-accent/5">
                      <span className="text-text-primary font-black min-w-[100px] flex items-center uppercase tracking-widest leading-relaxed">🔑 SHA-256:</span>
                      <span className="font-mono text-text-secondary break-all flex-1 leading-relaxed  uppercase font-bold">{apkInfo.structuredSig.hash}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLogModalOpen(true)}
                  className="p-6 bg-accent/5 border border-accent/10 rounded-2xl font-mono text-[11px] text-text-secondary w-full text-left transition-all hover:bg-accent/10 cursor-pointer"
                >
                  {apkInfo.signature.substring(0, 150)}...
                  <div className="mt-2 text-accent font-black uppercase tracking-widest text-[9px]">Click to view full log</div>
                </button>
              )}

              {apkInfo.structuredSig && (
                <button 
                  onClick={() => setIsLogModalOpen(true)}
                  className="text-[9px] text-accent font-black uppercase tracking-widest hover:underline flex items-center gap-2 mt-2 transition-all hover:gap-3 cursor-pointer opacity-70 hover:opacity-100"
                >
                  {t('verLogCompleto')} →
                </button>
              )}
            </div>
          </div>

          {/* Right Column (3/12) - Permissions */}
          <div className="lg:col-span-3">
            <div className="p-5 bg-card rounded-3xl border border-accent/5 shadow-sm space-y-4 h-fit flex flex-col">
              <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-accent" /> {t('permissions')} ({apkInfo.info.permissions.length})
              </h3>
              <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar max-h-[400px]">
                {apkInfo.info.permissions.map((perm, i) => (
                  <div key={i} className="px-4 py-3 bg-accent/[0.02] border border-accent/5 rounded-xl text-[10px] font-black text-text-primary opacity-60 hover:opacity-100 transition-all hover:bg-white hover:shadow-sm hover:border-accent/10 truncate group cursor-default uppercase">
                    {perm.split('.').pop()}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

  
      {/* Modal for Full Log */}
      <Modal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        title={t('verLogCompleto')}
      >
        <div className="space-y-4">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest pl-1">Raw Output Stream</p>
          <pre className="p-8 bg-black/95 rounded-[2rem] font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed custom-scrollbar shadow-2xl border border-white/5 selection:bg-accent selection:text-white">
            {apkInfo?.signature}
          </pre>
        </div>
      </Modal>
    </div>
  );
}

function InfoStat({ label, value, accent }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest leading-none opacity-50">{label}</p>
      <p className={`font-mono text-sm font-bold tracking-tight ${accent ? 'text-rose-500' : 'text-text-primary'}`}>{value || '-'}</p>
    </div>
  );
}
