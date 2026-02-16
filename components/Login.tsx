import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Briefcase, User, ArrowRight, Lock, Mail, Key, Loader2, ChevronRight, Check, CheckSquare, Square } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string, rememberMe: boolean) => void;
  onRegister: (name: string, email: string, pass: string, role: UserRole) => void;
  isLoading?: boolean;
  error?: string | null;
  setError?: (error: string | null) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, isLoading = false, error, setError }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.ACCOUNTANT);
  
  // Invitation State
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [inviterLogo, setInviterLogo] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Check for Invite Params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Support new short params (by, l, e) and old params (invitedBy, logo, email)
    const invitedBy = params.get('by') || params.get('invitedBy');
    const logo = params.get('l') || params.get('logo');
    const invitedEmail = params.get('e') || params.get('email');

    if (invitedBy) {
      setInviterName(invitedBy);
      setRole(UserRole.CLIENT); // Force Client role if invited
      setIsRegistering(true); // Go straight to register/activate
    }
    
    if (logo) {
       if (logo !== 'demo') {
         setInviterLogo(logo);
       }
    }

    if (invitedEmail) {
      setEmail(invitedEmail);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(name, email, password, role);
    } else {
      onLogin(email, password, rememberMe);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#EEF2F6]">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vh] h-[60vh] bg-brand-blue/20 rounded-full mix-blend-multiply filter blur-[90px] animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50vh] h-[50vh] bg-brand-purple/20 rounded-full mix-blend-multiply filter blur-[90px] animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-10">
          {inviterName ? (
            <div className="mb-6 animate-fade-in-up">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-neutral-light shadow-sm text-sm font-medium text-neutral-medium mb-4">
                 <span className="w-2 h-2 bg-status-success rounded-full animate-pulse"></span>
                 Convite Especial
               </div>
               
               {inviterLogo ? (
                 <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-white shadow-xl shadow-brand-blue/10 p-1 flex items-center justify-center border border-white/50">
                    <img src={inviterLogo} alt={inviterName} className="w-full h-full object-cover rounded-xl" />
                 </div>
               ) : (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
                    {inviterName.charAt(0)}
                  </div>
               )}
               
               <h2 className="text-3xl font-extrabold text-neutral-dark tracking-tight">
                 {inviterName}
               </h2>
               <p className="text-neutral-medium mt-1">
                 convidou-o para o <strong>ContaPortal</strong>
               </p>
            </div>
          ) : (
            <>
              <div className="inline-flex p-4 rounded-[2rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-xl mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-extrabold text-4xl shadow-lg shadow-brand-blue/30">
                  C
                </div>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-neutral-dark mb-2">
                Conta<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">Portal</span>
              </h1>
              <p className="text-neutral-medium font-medium">
                {isRegistering ? 'Crie o seu escritório digital' : 'Bem-vindo de volta'}
              </p>
            </>
          )}
        </div>

        {/* Main Card */}
        <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10" autoComplete="on">
            
            {/* Role Selection (Only for Register & Not Invited) */}
            {isRegistering && !inviterName && (
              <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-white/40 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.ACCOUNTANT)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    role === UserRole.ACCOUNTANT 
                      ? 'bg-white text-brand-purple shadow-sm' 
                      : 'text-neutral-medium hover:text-neutral-dark'
                  }`}
                >
                  <Briefcase size={16} /> Contabilista
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CLIENT)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    role === UserRole.CLIENT 
                      ? 'bg-white text-brand-blue shadow-sm' 
                      : 'text-neutral-medium hover:text-neutral-dark'
                  }`}
                >
                  <User size={16} /> Cliente
                </button>
              </div>
            )}

            {isRegistering && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-bold text-neutral-dark ml-2">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium" size={18} />
                  <input 
                    id="name"
                    name="name"
                    autoComplete="name"
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-neutral-dark font-medium transition-all"
                    placeholder="Ex: Mário Santos"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-neutral-dark ml-2">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium" size={18} />
                <input 
                  id="email"
                  name="email"
                  autoComplete="username"
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-neutral-dark font-medium transition-all"
                  placeholder="seu@email.com"
                  readOnly={!!inviterName} // Read only if invited via email
                />
                {inviterName && <Check size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-status-success" />}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-2">
                 <label htmlFor="password" className="text-xs font-bold text-neutral-dark">Palavra-passe</label>
                 {!isRegistering && <a href="#" className="text-xs font-bold text-brand-blue hover:text-brand-purple">Esqueceu-se?</a>}
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium" size={18} />
                <input 
                  id="password"
                  name="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-neutral-dark font-medium transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-status-error text-sm font-bold border border-red-100 flex items-center gap-2 animate-fade-in-up">
                <div className="w-1.5 h-1.5 rounded-full bg-status-error"></div>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl btn-liquid text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-brand-blue/30 transition-all mt-4"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>
                    {isRegistering ? (inviterName ? 'Aceitar Convite' : 'Criar Conta') : 'Entrar'}
                  </span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle (Hide if invited to keep flow focused) */}
          {!inviterName && (
            <div className="mt-8 pt-6 border-t border-white/40 text-center relative z-10">
              <p className="text-neutral-medium text-sm">
                {isRegistering ? 'Já tem conta?' : 'Ainda não tem conta?'}
                <button 
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError?.(null);
                  }}
                  className="ml-2 font-bold text-brand-blue hover:text-brand-purple transition-colors"
                >
                  {isRegistering ? 'Fazer Login' : 'Registar agora'}
                </button>
              </p>
            </div>
          )}

        </div>
        
        {/* Security Note */}
        {!isRegistering && (
          <div className="mt-8 text-center flex items-center justify-center gap-2 text-neutral-medium/60 text-xs">
            <Lock size={12} />
            <span>Ligação Encriptada e Segura</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;