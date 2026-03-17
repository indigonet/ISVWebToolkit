import React, { useState } from 'react';
import { 
  Play, 
  History, 
  Save, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Copy, 
  Code2,
  Cpu,
  RefreshCw,
  Send,
  Layers,
  Cloud,
  Eye,
  EyeOff,
  UserCheck,
  Key,
  Terminal,
  Activity
} from 'lucide-react';
import { useLang } from '../context/LangContext';

const EXAMPLE_BODY_C2C_SALE = {
  idTerminal: "20000885",
  idSucursal: 14845,
  serialNumber: "23C4KD4F9626",
  command: 100,
  amount: 5200,
  ticketNumber: "1235",
  printOnPos: false,
  saleType: 1,
  employeeId: 1,
  customId: "1234"
};

const EXAMPLE_BODY_SALE = {
  idTerminal: "80005000",
  idSucursal: "12983",
  serialNumber: "SNPRUEBA1234",
  command: 100, // Venta
  amount: 1000,
  installments: 1,
  type: "DEBIT"
};

const EXAMPLE_BODY_REFUND = {
  idTerminal: "80005000",
  idSucursal: "12983",
  serialNumber: "SNPRUEBA1234",
  command: 200, // Devolución
  amount: 1000,
  authorizationCode: "123456"
};

const METHODS = [
  { id: 'c2c_sale', label: 'Venta C2C (100)', icon: Cloud, color: 'text-accent', bg: 'bg-accent/10', template: EXAMPLE_BODY_C2C_SALE },
  { id: 'sale', label: 'Venta (100)', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10', template: EXAMPLE_BODY_SALE },
  { id: 'refund', label: 'Devolución (200)', icon: RefreshCw, color: 'text-amber-500', bg: 'bg-amber-500/10', template: EXAMPLE_BODY_REFUND },
  { id: 'void', label: 'Anulación (300)', icon: Send, color: 'text-rose-500', bg: 'bg-rose-500/10', template: { ...EXAMPLE_BODY_REFUND, command: 300 } },
  { id: 'last', label: 'Última Trans.', icon: History, color: 'text-sky-500', bg: 'bg-sky-500/10', template: { command: 400 } }
];

export default function SimulatorView({ onLog }) {
  const { t } = useLang();
  const [method, setMethod] = useState('POST');
  const [env, setEnv] = useState('uat');
  const [url, setUrl] = useState('https://api-uat-getnet-posintegrado.ione.cl/api/postxs/sale');
  const [body, setBody] = useState(JSON.stringify(EXAMPLE_BODY_C2C_SALE, null, 2));
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [fetchingToken, setFetchingToken] = useState(false);
  
  const [amount, setAmount] = useState(EXAMPLE_BODY_C2C_SALE.amount);
  const [authCode, setAuthCode] = useState('123456');

  const [clientId, setClientId] = useState('WnZrF+UjHigQ6PhpxpfAKVO9Om8pmPT6w9lyrTDe');
  const [clientSecret, setClientSecret] = useState('IUwdfCbp430/ZOMu7tnsF/pxPpin5NtffWgBZUkA');
  const [accessToken, setAccessToken] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const [history, setHistory] = useState([
    { id: 1, method: 'POST', endpoint: '/sale', status: 200, time: '12:44:22' },
    { id: 2, method: 'POST', endpoint: '/sale', status: 400, time: '12:42:10' }
  ]);

  const handleEnvChange = (newEnv) => {
    setEnv(newEnv);
    const baseUrl = newEnv === 'uat' 
      ? 'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/' 
      : 'https://api-getnet-posintegrado.ione.cl/api/postxs/';
    
    // Attempt to preserve the endpoint
    const endpoint = url.split('/').pop() || 'sale';
    setUrl(baseUrl + endpoint);
    onLog(`${t('envTitle')}: ${newEnv.toUpperCase()}`, 'info');
  };

  const handleGetToken = async () => {
    if (!clientId || !clientSecret) {
      onLog('Client ID and Secret are required', 'error');
      return;
    }

    setFetchingToken(true);
    onLog(t('fetchingToken'), 'info');

    try {
      const tokenUrl = env === 'uat' 
        ? 'https://api-uat-getnet-posintegrado.ione.cl/api/postxs/oauth/token' 
        : 'https://api-getnet-posintegrado.ione.cl/api/postxs/oauth/token';

      // Mocking the OAuth call - In a real scenario, this would be a fetch
      setTimeout(() => {
        const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({ sub: clientId, exp: Date.now() + 3600000 }))}.signature`;
        setAccessToken(mockToken);
        onLog(t('tokenSuccess'), 'success');
        setFetchingToken(false);
      }, 1500);

    } catch (e) {
      onLog(t('tokenError'), 'error');
      setFetchingToken(false);
    }
  };

  const handleSend = async () => {
    setLoading(true);
    onLog(`Sending ${method} request to ${url}...`, 'info');
    if (accessToken) {
      onLog(`Headers: { Authorization: Bearer ${accessToken.substring(0, 10)}... }`, 'info');
    }
    
    setTimeout(() => {
      const mockRes = {
        success: true,
        data: {
          authorizationCode: "123456",
          receiptNumber: "987654321",
          transactionDate: new Date().toISOString(),
          status: "APPROVED"
        }
      };
      setResponse(mockRes);
      setHistory(prev => [{
        id: Date.now(),
        method,
        endpoint: url.split('/').pop() || '/sale',
        status: 200,
        time: new Date().toLocaleTimeString('es-CL', { hour12: false })
      }, ...prev]);
      onLog('Transaction Approved', 'success');
      setLoading(false);
    }, 1200);
  };

  const syncBodyWithParams = (newVal, field) => {
    try {
      const currentBody = JSON.parse(body);
      currentBody[field] = field === 'amount' ? Number(newVal) : newVal;
      setBody(JSON.stringify(currentBody, null, 2));
    } catch (e) {
      console.warn("Invalid JSON in body, cannot sync params");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    onLog('Copiado al portapapeles', 'success');
  };

  return (
    <div className="max-w-[1700px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-10 bg-gradient-to-br from-accent/10 to-transparent rounded-[2.5rem] border border-accent/10 relative overflow-hidden group shadow-2xl shadow-accent/5">
        <div className="absolute inset-0 bg-grid-white opacity-5 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-accent rounded-2xl shadow-xl shadow-accent/20 animate-pulse">
                <Cloud className="w-6 h-6 text-white" />
             </div>
              <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tighter uppercase">{t('paymentSimulator') || 'Simulador Cloud to Cloud'}</h2>
          </div>
          <p className="text-text-secondary font-medium pl-1 text-sm sm:text-base">{t('simSubtitle')}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
           <button className="px-6 py-3 bg-card hover:bg-accent/5 border border-accent/10 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-95 shadow-lg group/btn cursor-pointer">
              <History className="w-4 h-4 text-text-secondary group-hover/btn:text-accent" /> {t('history') || 'HISTORIAL'}
           </button>
           <button className="px-6 py-3 bg-card hover:bg-accent/5 border border-accent/10 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-95 shadow-lg group/btn cursor-pointer">
              <Save className="w-4 h-4 text-text-secondary group-hover/btn:text-accent" /> {t('saveCommand') || 'GUARDAR'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card rounded-[2.5rem] border border-accent/10 shadow-xl overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:border-accent/20">
             <div className="p-6 bg-accent/[0.02] border-b border-accent/5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="bg-card border border-accent/10 rounded-xl px-4 py-3 font-black text-accent outline-none focus:ring-4 focus:ring-accent/5 transition-all cursor-pointer text-xs uppercase tracking-widest shadow-sm"
                  >
                    <option>POST</option>
                    <option>GET</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div className="flex-1 relative group w-full">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-text-secondary group-focus-within:text-accent transition-colors">
                      <Code2 className="w-4 h-4" />
                   </div>
                   <input 
                    type="text" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-card border border-accent/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-text-primary font-bold outline-none focus:ring-4 focus:ring-accent/5 transition-all shadow-sm"
                   />
                </div>
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-accent hover:bg-accent-warm px-8 py-3 rounded-2xl text-white font-black flex items-center gap-3 transition-all glow active:scale-95 cursor-pointer disabled:opacity-50 shadow-xl shadow-accent/20 text-xs uppercase tracking-widest w-full sm:w-auto"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                  {t('btnSend') || 'ENVIAR'}
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 flex-1 divide-y md:divide-y-0 md:divide-x divide-accent/5">
                <div className="flex flex-col">
                   <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5 text-accent" /> REQUEST JSON
                      </span>
                      <button 
                        onClick={() => copyToClipboard(body)}
                        className="p-1.5 hover:bg-accent/5 rounded-lg text-text-secondary hover:text-accent transition-all cursor-pointer"
                        title="Copy Body"
                      >
                         <Copy className="w-3.5 h-3.5" />
                      </button>
                   </div>
                   <div className="flex-1 p-6 relative">
                      <textarea 
                        className="w-full h-full min-h-[400px] bg-transparent outline-none resize-none text-emerald-500 font-mono text-[13px] font-bold leading-relaxed scroll-smooth custom-scrollbar selection:bg-accent selection:text-white"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        spellCheck="false"
                      />
                   </div>
                </div>

                <div className="flex flex-col bg-accent/[0.01]">
                   <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-sky-400" /> RESPONSE VIEW
                      </span>
                      {response && (
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[9px] font-black text-emerald-500">200 OK</span>
                        </div>
                      )}
                   </div>
                   <div className="flex-1 p-6 relative">
                      {response ? (
                        <pre className="font-mono text-[13px] text-sky-400 font-bold leading-relaxed animate-in fade-in duration-500">
                          {JSON.stringify(response, null, 2)}
                        </pre>
                      ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-text-secondary/20 italic gap-4 grayscale opacity-40">
                           <Activity className="w-16 h-16" />
                           <p className="text-xs font-black uppercase tracking-widest">Waiting for request...</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card rounded-[2.5rem] border border-accent/10 p-8 shadow-xl space-y-8">
             <div className="space-y-4">
                <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Layers className="w-4 h-4 text-accent" /> {t('envTitle')}
                </h3>
                <div className="flex p-1 bg-accent/5 rounded-2xl border border-accent/10">
                   <button 
                    onClick={() => handleEnvChange('uat')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer ${env === 'uat' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:bg-accent/5'}`}
                   >
                     {t('uat')}
                   </button>
                   <button 
                    onClick={() => handleEnvChange('prod')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all cursor-pointer ${env === 'prod' ? 'bg-rose-600 text-white shadow-lg' : 'text-text-secondary hover:bg-accent/5'}`}
                   >
                     {t('production')}
                   </button>
                </div>
             </div>

             <div className="space-y-1">
                <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" /> {t('quickActions')}
                </h3>
             </div>

             <div className="grid grid-cols-1 gap-3">
                {METHODS.map((m) => (
                  <button 
                    key={m.id}
                    onClick={() => {
                      onLog(`Cargando plantilla: ${m.label}`, 'info');
                      setBody(JSON.stringify(m.template, null, 2));
                      if (m.template.amount) setAmount(m.template.amount);
                      if (m.template.authorizationCode) setAuthCode(m.template.authorizationCode);
                    }}
                    className={`p-4 rounded-2xl border border-transparent hover:border-accent/20 transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98] ${m.bg}`}
                  >
                    <div className="flex items-center gap-4">
                       <m.icon className={`w-5 h-5 ${m.color}`} />
                       <span className={`text-sm font-black tracking-tight ${m.color} uppercase`}>{m.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-text-secondary/30 group-hover:translate-x-1 group-hover:text-accent transition-all" />
                  </button>
                ))}
             </div>

             <div className="space-y-4 pt-4">
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('amount') || 'Monto'}</span>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => {
                      setAmount(e.target.value);
                      syncBodyWithParams(e.target.value, 'amount');
                    }}
                    className="w-full bg-background border border-accent/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm" 
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('authCode') || 'Código Autorización'}</span>
                  <input 
                    type="text" 
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.target.value);
                      syncBodyWithParams(e.target.value, 'authorizationCode');
                    }}
                    placeholder="123456"
                    className="w-full bg-background border border-accent/10 rounded-xl px-4 py-3 outline-none focus:border-accent transition-all font-black text-text-primary text-sm shadow-sm" 
                  />
                </label>
             </div>

             <div className="pt-8 border-t border-accent/5 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('clientId')}</label>
                    <div className="relative group">
                      <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                      <input 
                        type="text" 
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="w-full bg-background border border-accent/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-text-primary focus:border-accent outline-none transition-all shadow-sm"
                        placeholder="client_id_..."
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">{t('clientSecret')}</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                      <button 
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-accent cursor-pointer transition-colors"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <input 
                        type={showSecret ? "text" : "password"} 
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        className="w-full bg-background border border-accent/10 rounded-xl py-3 pl-12 pr-12 text-sm font-bold text-text-primary focus:border-accent outline-none transition-all shadow-sm"
                        placeholder="••••••••••••"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleGetToken}
                  disabled={fetchingToken}
                  className="w-full py-5 rounded-3xl bg-accent text-white hover:bg-accent-warm hover:shadow-2xl hover:scale-[1.02] transition-all font-black uppercase tracking-widest flex items-center justify-center gap-3 group cursor-pointer active:scale-95 text-xs shadow-xl shadow-accent/20"
                >
                   {fetchingToken ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <>
                       <ShieldCheck className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" /> 
                       {t('getToken')}
                     </>
                   )}
                </button>

                {accessToken && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-between group animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                       <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter truncate">Bearer Token Ready</span>
                    </div>
                    <button 
                      onClick={() => {
                        setAccessToken('');
                        onLog('Token cleared', 'info');
                      }}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest cursor-pointer ml-2 shrink-0"
                    >
                      Clear
                    </button>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-card rounded-[2.5rem] border border-accent/10 p-8 shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <History className="w-24 h-24" />
             </div>
             <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-6 relative z-10">{t('historyTitle')}</h3>
             
             <div className="space-y-4 relative z-10">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between group cursor-pointer hover:bg-accent/5 p-2 rounded-xl transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-1.5 rounded-full ${h.status === 200 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-text-primary uppercase tracking-tight">{h.endpoint}</span>
                           <span className="text-[9px] font-bold text-text-secondary/60">{h.method} • {h.time}</span>
                        </div>
                     </div>
                     <span className={`text-[10px] font-black tracking-widest ${h.status === 200 ? 'text-emerald-500' : 'text-rose-500'}`}>{h.status}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
