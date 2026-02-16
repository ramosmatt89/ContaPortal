import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Save, Loader2 } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API
    setTimeout(() => {
      onUpdateUser({ name, email });
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Configurações</h2>
        <p className="text-neutral-medium text-lg">Gerencie o seu perfil e preferências da conta.</p>
      </div>

      <div className="glass-panel p-8 rounded-[2.5rem] max-w-2xl relative">
        <h3 className="font-bold text-xl text-neutral-dark mb-6">Perfil do Utilizador</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-dark uppercase tracking-wide ml-1">Nome Completo</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-neutral-dark font-medium transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-xs font-bold text-neutral-dark uppercase tracking-wide ml-1">Endereço de Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-neutral-dark font-medium transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 rounded-2xl btn-liquid text-white font-bold flex items-center gap-2 shadow-lg disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>Guardar Alterações</span>
            </button>
            
            {success && (
              <span className="text-status-success font-bold text-sm animate-fade-in-up">
                Perfil atualizado com sucesso!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;