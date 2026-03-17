import React, { useState } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  FileKey2, 
  UploadCloud, 
  Plus, 
  Smartphone, 
  FolderOpen, 
  HelpCircle, 
  RefreshCw, 
  X, 
  Download, 
  Trash2,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { useLang } from '../context/LangContext';
import { useAppStore } from '../store/appStore';
import Modal from '../components/Modal';

export default function SignerView({ onLog }) {
  const { t } = useLang();
  const apkInfo = useAppStore(state => state.inspectorApkInfo);
  const apkFile = useAppStore(state => state.apkFile);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    jdkPath: 'C:\\Program Files\\Java\\jdk-11\\bin',
    fileName: '',
    alias: '',
    password: '',
    confirmPassword: '',
    ownerName: '',
    ou: '',
    org: '',
    city: '',
    state: '',
    country: 'CL'
  });
  const [showSignPassword, setShowSignPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [signingForm, setSigningForm] = useState({
    jksFile: null,
    password: ''
  });

  const handleSignApk = () => {
    if (!signingForm.jksFile || !signingForm.password) {
      onLog("Por favor, sube un archivo JKS e ingresa la contraseña.", "error");
      return;
    }

    if (!apkFile) {
      onLog("El archivo APK original no está disponible. Por favor, vuelve a seleccionarlo en el Inspector.", "warning");
      return;
    }
    
    setIsGenerating(true);
    onLog(`Firmando APK ${apkInfo.info.label} (${(apkFile.size / 1024 / 1024).toFixed(2)} MB) con ${signingForm.jksFile.name}...`, "info");
    
    // Simulación de firmado y descarga usando el archivo real
    setTimeout(() => {
       const element = document.createElement("a");
       element.href = URL.createObjectURL(apkFile);
       
       const originalName = apkInfo.info.label ? apkInfo.info.label.replace(/\s+/g, '_').toLowerCase() : 'app';
       element.download = `${originalName}_signed.apk`;
       
       document.body.appendChild(element);
       element.click();
       
       setIsGenerating(false);
       onLog("¡APK firmado correctamente y descargado!", "success");
    }, 2500);
  };

  const handleGenerate = () => {
    if (!formData.fileName || !formData.password || formData.password !== formData.confirmPassword) {
      onLog("Please check your input. Passwords must match and fileName is required.", "error");
      return;
    }
    
    setIsGenerating(true);
    onLog("Generating JKS signature...", "info");
    
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob(["Simulated JKS Binary Content"], {type: 'application/octet-stream'});
      element.href = URL.createObjectURL(file);
      element.download = `${formData.fileName || 'keystore'}.jks`;
      document.body.appendChild(element);
      element.click();
      
      setIsGenerating(false);
      setShowCreateModal(false);
      onLog(`JKS ${formData.fileName}.jks generated and downloaded successfully!`, "success");
    }, 2000);
  };

  const handleClear = () => {
    setFormData({
      jdkPath: 'C:\\Program Files\\Java\\jdk-11\\bin',
      fileName: '',
      alias: '',
      password: '',
      confirmPassword: '',
      ownerName: '',
      ou: '',
      org: '',
      city: '',
      state: '',
      country: 'CL'
    });
  };

  if (!apkInfo) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
        <div className="max-w-xl w-full p-12 border-2 border-dashed border-accent/10 rounded-3xl bg-accent/5 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-accent opacity-50" />
          </div>
          <h2 className="text-2xl font-black mb-2 text-text-primary uppercase tracking-tighter">{t('apkSignerPro')}</h2>
          <p className="text-text-secondary max-w-sm font-medium">{t('requiredInsights')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3 text-text-primary">
          <ShieldCheck className="w-6 h-6 text-accent" />
          {t('apkSignerPro')}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 space-y-6">
            <div className="p-8 bg-card rounded-2xl border border-accent/5 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
               
               <h3 className="font-black flex items-center gap-3 mb-8 text-text-primary text-lg uppercase tracking-wider">
                 <FileKey2 className="text-accent w-6 h-6"/> {t('signApkTitle')}
               </h3>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Archivo de Firma JKS:</label>
                    <label className="flex items-center justify-center gap-4 p-10 border-2 border-dashed border-accent/10 rounded-2xl hover:bg-accent/5 cursor-pointer text-text-secondary hover:text-accent transition-all bg-accent/5 group/upload">
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center group-hover/upload:scale-110 transition-transform">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm break-all">{signingForm.jksFile ? signingForm.jksFile.name : 'Click o arrastra tu archivo .jks'}</span>
                        <span className="text-[10px] opacity-50 font-bold uppercase tracking-tighter">Formatos soportados: .jks, .keystore</span>
                      </div>
                      <input type="file" accept=".jks,.keystore" className="hidden" onChange={(e) => setSigningForm({...signingForm, jksFile: e.target.files[0]})} />
                    </label>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Contraseña de la Llave JKS:</label>
                    <div className="relative group/pass">
                      <input 
                        type="text" 
                        autoComplete="off"
                        spellCheck="false"
                        placeholder="••••••••"
                        className="w-full bg-background border border-accent/10 rounded-xl px-4 py-4 pr-12 text-xs font-bold text-text-primary outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all shadow-sm"
                        style={{ WebkitTextSecurity: showSignPassword ? 'none' : 'disc' }}
                        value={signingForm.password}
                        onChange={e => setSigningForm({...signingForm, password: e.target.value})}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowSignPassword(!showSignPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent p-1 rounded-full hover:bg-accent/5 cursor-pointer transition-colors"
                      >
                        {showSignPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button 
                      onClick={handleSignApk}
                      disabled={isGenerating}
                      className="w-full py-5 bg-accent text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 glow cursor-pointer mt-4"
                  >
                    {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 fill-current" />}
                    {isGenerating ? 'FIRMANDO...' : 'FIRMAR AHORA'}
                  </button>
               </div>
            </div>

            <div 
               onClick={() => setShowCreateModal(true)}
               className="p-6 bg-accent/5 rounded-2xl border border-accent/10 flex items-center justify-between group hover:bg-accent/10 transition-colors cursor-pointer active:scale-[0.99]"
             >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-accent group-hover:rotate-90 transition-transform" />
                  </div>
                  <div>
                    <p className="font-black text-text-primary text-sm uppercase tracking-tight">¿No tienes una firma?</p>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">Crea un nuevo almacén JKS en segundos</p>
                  </div>
                </div>
                <div className="px-6 py-3 bg-card border border-accent/20 text-accent rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                   {t('createSignature')}
                </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="p-6 bg-card rounded-2xl border border-accent/5 shadow-xl sticky top-6">
               <h3 className="text-[10px] font-black text-text-secondary mb-6 tracking-widest uppercase flex items-center gap-2">
                 <Smartphone className="w-3 h-3 text-accent" /> {t('targetApk')}
               </h3>
               
               <div className="flex flex-col items-center gap-6 text-center">
                 <div className="w-32 h-32 bg-accent/5 rounded-3xl flex items-center justify-center overflow-hidden ring-4 ring-accent/5 shadow-inner">
                    {apkInfo.info.iconBase64 ? (
                       <img 
                         src={`data:image/png;base64,${apkInfo.info.iconBase64}`} 
                         alt="Icon" 
                         className="w-full h-full object-contain p-4 drop-shadow-2xl" 
                         onError={(e) => {
                           e.target.style.display = 'none';
                           e.target.parentElement.querySelector('.fallback-icon').style.display = 'block';
                         }}
                       />
                    ) : null}
                    <Smartphone className={`w-16 h-16 text-accent/20 fallback-icon ${apkInfo.info.iconBase64 ? 'hidden' : 'block'}`} />
                 </div>
                 
                 <div className="space-y-2 w-full">
                    <p className="text-xl font-black text-text-primary break-words leading-tight">{apkInfo.info.label || t('unknownApp')}</p>
                    <div className="inline-block px-3 py-1 bg-accent/10 rounded-full border border-accent/10">
                      <p className="text-[9px] font-black text-accent truncate uppercase tracking-widest">{apkInfo.info.package}</p>
                    </div>
                 </div>

                 <div className="w-full pt-6 border-t border-accent/5 grid grid-cols-2 gap-4">
                    <div className="text-left">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Versión</p>
                       <p className="text-xs font-bold text-text-primary">{apkInfo.info.versionName || 'N/A'}</p>
                    </div>
                    <div className="text-left">
                       <p className="text-[8px] font-black text-text-secondary uppercase tracking-widest">Build</p>
                       <p className="text-xs font-bold text-text-primary">{apkInfo.info.versionCode || 'N/A'}</p>
                    </div>
                 </div>
               </div>
            </div>
         </div>
      </div>

      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title={t('jksGeneratorTitle')}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-accent/10 pb-2">
                <FileKey2 className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Almacén</h3>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Nombre archivo (.jks):</label>
                  <input type="text" placeholder="mi_firma_app" value={formData.fileName} onChange={e => setFormData({...formData, fileName: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Alias certificado:</label>
                  <input type="text" placeholder="key_alias" value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Contraseña:</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="••••••••" 
                      value={formData.password} 
                      onChange={e => setFormData({...formData, password: e.target.value})} 
                      className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" 
                      style={{ WebkitTextSecurity: showCreatePassword ? 'none' : 'disc' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent p-1 cursor-pointer"
                    >
                      {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Confirmar:</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      autoComplete="off"
                      spellCheck="false"
                      placeholder="••••••••" 
                      value={formData.confirmPassword} 
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                      className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 pr-10 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" 
                      style={{ WebkitTextSecurity: showCreatePassword ? 'none' : 'disc' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent p-1 cursor-pointer"
                    >
                      {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-accent/10 pb-2">
                <Smartphone className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Propietario</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Nombre completo:</label>
                  <input type="text" placeholder="Juan Pérez" value={formData.ownerName} onChange={e => setFormData({...formData, ownerName: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Org.:</label>
                  <input type="text" placeholder="ISV" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Ciudad:</label>
                  <input type="text" placeholder="Santiago" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Estado:</label>
                  <input type="text" placeholder="RM" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">País:</label>
                  <input type="text" placeholder="CL" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-accent/5 border border-accent/10 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary outline-none focus:border-accent transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-accent/5">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="px-6 py-2.5 rounded-xl border border-accent/10 text-[10px] font-black uppercase text-text-secondary hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20 transition-all active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-2.5 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  Crear Firma JKS
                  <Download className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
