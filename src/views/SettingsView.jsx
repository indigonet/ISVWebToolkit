import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  ShieldCheck, 
  Terminal, 
  Cpu, 
  Code2, 
  Activity, 
  Zap,
  Globe,
  Smartphone,
  Info
} from 'lucide-react';
import { useLang } from '../context/LangContext';

const ToolCard = ({ title, tools, icon: Icon, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card/50 backdrop-blur-xl border border-accent/10 rounded-[2.5rem] p-8 shadow-2xl shadow-accent/5 hover:border-accent/20 transition-all group overflow-hidden relative"
  >
    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
       <Icon className="w-24 h-24" />
    </div>
    
    <div className="relative z-10 space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-accent/10 rounded-2xl text-accent">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-black text-text-primary tracking-tight uppercase">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {tools.map((tool, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-4 bg-accent/[0.02] border border-accent/5 rounded-2xl group/item hover:bg-accent/5 transition-all"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-40 group-hover/item:scale-150 transition-transform" />
            <span className="text-sm font-bold text-text-secondary group-hover/item:text-text-primary transition-colors uppercase tracking-widest">{tool}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default function SettingsView() {
  const { t } = useLang();

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="inline-flex p-4 bg-accent/10 rounded-3xl text-accent mb-4"
        >
           <Settings className="w-8 h-8" />
        </motion.div>
        <h2 className="text-5xl font-black text-text-primary tracking-tighter uppercase">{t('settings') || 'AJUSTES'}</h2>
        <p className="text-text-secondary font-medium text-lg italic opacity-70">ISV Web Toolkit v1.0.0-PRO</p>
      </div>

      {/* Tools Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ToolCard 
          title="Core Tools" 
          icon={Cpu}
          delay={0.2}
          tools={['Android Debug Bridge (ADB)', 'Jarsigner (JDK)', 'Apksigner (Android SDK)']} 
        />
        <ToolCard 
          title="Security & Testing" 
          icon={ShieldCheck}
          delay={0.4}
          tools={['Ostorlabs (Static/Dynamic Analysis)', 'Apptim (Performance Checks)', 'ZAP Proxy (OWASP)']} 
        />
      </div>

      {/* Credits Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pt-16 border-t border-accent/5 text-center space-y-8"
      >
        <div className="space-y-2">
           <h3 className="text-xs font-black text-text-secondary uppercase tracking-[0.4em] opacity-50">CREATED BY</h3>
           <p className="text-3xl font-black text-text-primary tracking-tighter hover:text-accent transition-colors cursor-default">
             INDIGONET LABS
           </p>
        </div>

        <div className="flex justify-center flex-wrap gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-2 group cursor-pointer hover:text-accent font-bold text-xs uppercase tracking-widest">
              <Code2 className="w-4 h-4" /> Fullstack Engine
           </div>
           <div className="flex items-center gap-2 group cursor-pointer hover:text-accent font-bold text-xs uppercase tracking-widest">
              <Smartphone className="w-4 h-4" /> Mobile Security
           </div>
           <div className="flex items-center gap-2 group cursor-pointer hover:text-accent font-bold text-xs uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Performance Team
           </div>
        </div>

        <div className="pt-12 text-[10px] font-bold text-text-secondary/30 uppercase tracking-[0.2em] max-w-lg mx-auto leading-relaxed italic">
          ESTA PLATAFORMA HA SIDO DISEÑADA PARA FACILITAR LA DEPURACIÓN Y PRUEBAS DE APLICACIONES EN POS INTEGRADOS. TODOS LOS DERECHOS RESERVADOS © {new Date().getFullYear()} INDIGONET.
        </div>
      </motion.div>

      {/* Micro-stats / Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
         {[
           { label: 'Platform Status', value: 'Ready', icon: Activity, color: 'text-emerald-500' },
           { label: 'API Connection', value: 'Stable', icon: Globe, color: 'text-accent' },
           { label: 'Toolkit Mode', value: 'Developer', icon: Info, color: 'text-amber-500' }
         ].map((stat, i) => (
           <div key={i} className="bg-card/30 border border-accent/5 rounded-3xl p-6 flex items-center gap-4 hover:bg-card/50 transition-all">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                 <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest opacity-50">{stat.label}</p>
                 <p className="text-sm font-bold text-text-primary">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
