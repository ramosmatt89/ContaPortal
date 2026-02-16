import React from 'react';
import { UserRole } from '../types';
import { Briefcase, User, ArrowRight, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-neutral-bg">
      
      {/* Vivid Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vh] h-[60vh] bg-brand-blue/20 rounded-full mix-blend-multiply filter blur-[90px] animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50vh] h-[50vh] bg-brand-purple/20 rounded-full mix-blend-multiply filter blur-[90px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[50vh] h-[50vh] bg-status-success/10 rounded-full mix-blend-multiply filter blur-[90px] animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col justify-center items-center w-full">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-24 animate-fade-in-up flex-shrink-0 w-full">
          <div className="inline-flex p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-xl mb-6 md:mb-10 animate-float">
            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-brand-blue via-brand-blue to-brand-purple flex items-center justify-center text-white font-extrabold text-4xl md:text-6xl shadow-lg shadow-brand-blue/30">
              C
            </div>
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-neutral-dark mb-2 md:mb-6 drop-shadow-sm leading-tight">
            Conta<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Portal</span>
          </h1>
          <p className="text-sm md:text-xl text-neutral-medium max-w-2xl mx-auto font-medium leading-relaxed px-4">
            A revolução da contabilidade digital. <br /> 
            <span className="text-brand-blue">Fluída</span>, <span className="text-brand-purple">Vibrante</span> e <span className="text-status-success">Conectada</span>.
          </p>
        </div>

        {/* Buttons Grid - Stacked on mobile for better touch targets, 2 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 max-w-4xl mx-auto px-0 md:px-4 w-full">
          
          {/* Accountant Card - NOW FIRST */}
          <button 
             onClick={() => onLogin(UserRole.ACCOUNTANT)}
             className="group relative p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] glass-panel hover:border-brand-purple/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-purple/20 active:scale-95 flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] md:rounded-[3rem]"></div>
            <div className="relative flex flex-col items-center md:items-start text-center md:text-left h-full justify-center md:justify-start w-full">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-purple-50 text-brand-purple flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-brand-purple group-hover:to-[#a45ee5] group-hover:text-white transition-all duration-300 shadow-sm">
                <Briefcase className="w-7 h-7 md:w-10 md:h-10" />
              </div>
              <h3 className="text-lg md:text-3xl font-bold text-neutral-dark mb-0 md:mb-4 group-hover:text-brand-purple transition-colors">Sou Contabilista</h3>
              <p className="hidden md:block text-neutral-medium text-lg mb-8 leading-relaxed">
                Visão 360º dos seus clientes. Valide documentos e gerencie prazos com eficiência.
              </p>
               <div className="hidden md:flex mt-auto items-center gap-3 text-base font-bold text-brand-purple opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                Aceder ao Backoffice <ArrowRight size={20} />
              </div>
            </div>
          </button>

          {/* Client Card - NOW SECOND */}
          <button 
            onClick={() => onLogin(UserRole.CLIENT)}
            className="group relative p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] glass-panel hover:border-brand-blue/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-blue/20 active:scale-95 flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] md:rounded-[3rem]"></div>
            <div className="relative flex flex-col items-center md:items-start text-center md:text-left h-full justify-center md:justify-start w-full">
              <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3 md:mb-8 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-brand-blue group-hover:to-[#4e9aff] group-hover:text-white transition-all duration-300 shadow-sm">
                <User className="w-7 h-7 md:w-10 md:h-10" />
              </div>
              <h3 className="text-lg md:text-3xl font-bold text-neutral-dark mb-0 md:mb-4 group-hover:text-brand-blue transition-colors">Sou Cliente</h3>
              <p className="hidden md:block text-neutral-medium text-lg mb-8 leading-relaxed">
                Envie documentos, consulte obrigações fiscais e aprove pagamentos em segundos.
              </p>
              
              {/* Disclaimer */}
              <div className="flex items-center gap-2 mb-4 md:mb-0 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                 <Lock size={12} className="text-neutral-medium" />
                 <span className="text-xs text-neutral-medium font-medium">Acesso restrito por convite</span>
              </div>

              <div className="hidden md:flex mt-auto items-center gap-3 text-base font-bold text-brand-blue opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                Entrar no Portal <ArrowRight size={20} />
              </div>
            </div>
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default Login;