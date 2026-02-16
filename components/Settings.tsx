import React, { useState, useRef } from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, Mail, Save, Loader2, Upload, Trash2, Camera, LogOut, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onLogout: () => void;
  onCancelAccount: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onLogout, onCancelAccount }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Confirmation State for Settings Page
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAccountant = user.role === UserRole.ACCOUNTANT;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API save
    setTimeout(() => {
      onUpdateUser({ name, email, avatarUrl });
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 800);
  };
  
  const handleConfirmCancel = () => {
    if (confirmText === 'CANCELAR') {
      setIsCancelModalOpen(false);
      onCancelAccount();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      <div>
        <h2 className="text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Configurações</h2>
        <p className="text-neutral-medium text-lg">
          {isAccountant ? 'Identidade do Escritório e Perfil.' : 'Perfil da Empresa e Preferências.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 rounded-[2.5rem] relative">
            <h3 className="font-bold text-xl text-neutral-dark mb-6">
              {isAccountant ? 'Dados do Escritório (Marca)' : 'Dados da Empresa'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Branding / Logo Section */}
              <div className="mb-8 p-6 bg-white/40 rounded-[2rem] border border-white/60">
                 <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wide mb-4">
                   {isAccountant ? 'Logótipo do Escritório' : 'Logótipo / Foto de Perfil'}
                 </label>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                   {/* Preview */}
                   <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-neutral-light/50 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="text-neutral-medium/50" size={32} />
                        )}
                      </div>
                      {/* Active Status Indicator */}
                      <div className="absolute -bottom-2 -right-2 bg-status-success w-6 h-6 rounded-full border-4 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                   </div>

                   {/* Actions */}
                   <div className="flex flex-col gap-3 w-full sm:w-auto">
                     <div className="flex gap-3">
                       <button
                         type="button" 
                         onClick={() => fileInputRef.current?.click()}
                         className="px-5 py-2.5 rounded-xl bg-white text-brand-blue font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors border border-blue-100 flex items-center gap-2"
                       >
                         <Upload size={16} /> Carregar Imagem
                       </button>
                       <input 
                         ref={fileInputRef}
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleFileChange}
                       />
                       
                       {avatarUrl && (
                          <button
                            type="button" 
                            onClick={handleRemovePhoto}
                            className="px-3 py-2.5 rounded-xl bg-red-50 text-status-error font-bold text-sm hover:bg-red-100 transition-colors border border-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                       )}
                     </div>
                     <p className="text-xs text-neutral-medium max-w-xs leading-relaxed">
                       Recomendado: Imagem quadrada (PNG, JPG). {isAccountant ? 'Esta imagem aparecerá no portal dos seus clientes.' : 'Esta imagem aparecerá no dashboard do seu contabilista.'}
                     </p>
                   </div>
                 </div>
              </div>

              {/* Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-dark uppercase tracking-wide ml-1">
                  {isAccountant ? 'Nome do Escritório / Contabilista' : 'Nome da Empresa'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium" size={18} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 text-neutral-dark font-medium transition-all"
                    placeholder={isAccountant ? "Ex: Silva Contabilidade" : "Ex: Minha Empresa Lda"}
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
                  className="px-8 py-3.5 rounded-2xl btn-liquid text-white font-bold flex items-center gap-2 shadow-lg disabled:opacity-70 active:scale-95 transition-transform"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>Guardar Alterações</span>
                </button>
                
                {success && (
                  <span className="text-status-success font-bold text-sm flex items-center gap-1 animate-fade-in-up">
                    <div className="w-2 h-2 bg-status-success rounded-full"></div>
                    Perfil atualizado com sucesso!
                  </span>
                )}
              </div>
            </form>
          </div>
          
          {/* Danger Zone - Visible on Mobile mostly since sidebar hides */}
          <div className="glass-panel p-8 rounded-[2.5rem] border border-red-100/50">
             <h3 className="font-bold text-xl text-neutral-dark mb-6 flex items-center gap-2">
                <AlertTriangle className="text-status-error" size={24} />
                Zona de Perigo
             </h3>
             <div className="space-y-4">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-light hover:bg-neutral-50 transition-colors text-neutral-dark font-bold"
                >
                   <span className="flex items-center gap-3">
                      <LogOut size={20} className="text-neutral-medium"/> Sair da Conta
                   </span>
                </button>
                
                <button 
                  onClick={() => { setIsCancelModalOpen(true); setConfirmText(''); }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors text-status-error font-bold"
                >
                   <span className="flex items-center gap-3">
                      <Trash2 size={20} /> Cancelar Conta
                   </span>
                </button>
             </div>
          </div>
        </div>

        {/* Sidebar Help / Preview */}
        <div className="glass-panel-dark p-8 rounded-[2.5rem] flex flex-col items-center text-center h-fit">
           <h4 className="font-bold text-neutral-dark mb-4">Pré-visualização</h4>
           <div className="w-full p-4 bg-white/50 rounded-2xl border border-white mb-4">
             <div className="flex items-center gap-3 mb-3">
               <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-neutral-light flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold">
                      {name.charAt(0)}
                    </div>
                  )}
               </div>
               <div className="text-left overflow-hidden">
                 <div className="text-xs font-bold text-neutral-dark truncate">{name}</div>
                 <div className="text-[10px] text-neutral-medium truncate">{email}</div>
               </div>
             </div>
             <div className="h-2 w-2/3 bg-neutral-light rounded-full mb-2"></div>
             <div className="h-2 w-1/2 bg-neutral-light rounded-full"></div>
           </div>
           <p className="text-xs text-neutral-medium">
             É assim que a sua identidade aparecerá {isAccountant ? 'para os seus clientes e na barra lateral.' : 'para o seu contabilista.'}
           </p>
        </div>
      </div>
      
      {/* Cancellation Modal (Duplicated logic for accessibility from Settings) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/80 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-status-error rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-extrabold text-neutral-dark text-center mb-2">Cancelar Conta?</h3>
            <p className="text-neutral-medium text-center mb-6">
              Tem a certeza de que deseja eliminar a conta? <strong>Esta ação é irreversível e os seus dados serão apagados imediatamente.</strong>
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-neutral-dark mb-2 text-center uppercase">
                Digite "CANCELAR" para confirmar
              </label>
              <input 
                type="text" 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-3 text-center border-2 border-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-xl outline-none font-bold text-status-error placeholder:text-red-200"
                placeholder="CANCELAR"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl bg-neutral-light text-neutral-medium font-bold hover:bg-neutral-200 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={confirmText !== 'CANCELAR'}
                className="flex-1 py-3.5 rounded-xl bg-status-error text-white font-bold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;