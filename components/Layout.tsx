import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  LogOut,
  Plus,
  Menu,
  AlertTriangle,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onCancelAccount: () => void;
  branding?: { name: string; logo?: string };
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  currentView, 
  onNavigate, 
  onLogout,
  onCancelAccount,
  branding = { name: 'ContaPortal', logo: '' } 
}) => {
  const isClient = user.role === UserRole.CLIENT;
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const menuItems = isClient 
    ? [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
        { id: 'documents', icon: FileText, label: 'Docs' },
        { id: 'authorizations', icon: CheckCircle, label: 'Validar' },
        { id: 'profile', icon: Settings, label: 'Perfil' },
      ]
    : [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
        { id: 'clients', icon: Users, label: 'Clientes' },
        { id: 'documents', icon: FileText, label: 'Validar' },
        { id: 'obligations', icon: CheckCircle, label: 'Obrigações' },
        { id: 'settings', icon: Settings, label: 'Config' },
      ];

  const handleConfirmCancel = () => {
    if (confirmText === 'CANCELAR') {
      setIsCancelModalOpen(false);
      onCancelAccount();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-neutral-dark selection:bg-brand-blue selection:text-white">
      
      {/* Desktop Sidebar - Floating Glass Style */}
      <aside className="hidden lg:flex flex-col fixed inset-y-4 left-4 w-72 glass-panel-dark rounded-[2rem] z-50">
        <div className="p-8 pb-4 flex items-center gap-4">
          {/* Dynamic Branding Logo (Accountant's Logo) */}
          {branding.logo ? (
            <div className="w-10 h-10 rounded-xl shadow-lg shadow-brand-blue/20 overflow-hidden bg-white shrink-0">
              <img src={branding.logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple shadow-lg shadow-brand-blue/30 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {branding.name.charAt(0)}
            </div>
          )}
          <span className="text-xl font-bold tracking-tight text-neutral-dark truncate" title={branding.name}>
            {branding.name}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                currentView === item.id 
                  ? 'bg-blue-50 text-brand-blue shadow-sm font-bold' 
                  : 'text-neutral-medium hover:bg-white/60 hover:text-brand-purple'
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-brand-blue to-brand-purple rounded-r-full transition-transform duration-300 ${currentView === item.id ? 'scale-y-100' : 'scale-y-0'}`}></div>
              <item.icon size={22} className={`transition-transform duration-300 ${currentView === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-[15px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mx-4 mb-4 border-t border-neutral-light/50 space-y-2">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-3 text-neutral-medium hover:text-neutral-dark hover:bg-neutral-light/50 rounded-2xl transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
          
          <button 
            onClick={() => { setIsCancelModalOpen(true); setConfirmText(''); }}
            className="w-full flex items-center gap-4 px-5 py-3 text-status-error hover:bg-red-50 rounded-2xl transition-all duration-300 opacity-70 hover:opacity-100"
          >
            <AlertTriangle size={20} />
            <span className="font-medium">Cancelar conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 relative pb-28 lg:pb-8 lg:pr-4 lg:pt-4">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 lg:relative lg:top-auto px-4 py-4 lg:px-0 lg:py-0 flex justify-between items-center mb-6 lg:mb-10 transition-all duration-300">
          
          {/* Mobile Logo / Branding */}
          <div className="lg:hidden flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden shrink-0">
               {branding.logo ? (
                 <img src={branding.logo} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 branding.name.charAt(0)
               )}
            </div>
            <h1 className="font-bold text-lg text-neutral-dark tracking-tight truncate max-w-[200px]">{branding.name}</h1>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-lg relative glass-panel rounded-2xl mx-4 group focus-within:ring-2 focus-within:ring-brand-blue/30 transition-all">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium group-focus-within:text-brand-blue transition-colors" size={20} />
            <input 
              type="text" 
              placeholder={isClient ? "Pesquisar documentos..." : "Pesquisar clientes, NIF..."}
              className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-neutral-dark font-medium placeholder:text-neutral-medium/50"
            />
          </div>

          {/* User Profile (Logged In User) */}
          <div className="flex items-center gap-3 lg:gap-5">
             <button className="relative p-3 rounded-2xl glass-panel hover:bg-white transition-all active:scale-95 group hover:shadow-lg hover:shadow-brand-blue/10">
              <Bell size={22} className="text-neutral-medium group-hover:text-brand-blue transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-status-error rounded-full border-2 border-white shadow-sm animate-pulse"></span>
             </button>
             
             <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-neutral-light/50">
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-dark">{user.name}</p>
                  <p className="text-xs font-medium text-neutral-medium">{isClient ? user.email : 'Contabilista'}</p>
                </div>
                <div className="relative group cursor-pointer" onClick={() => onNavigate(isClient ? 'profile' : 'settings')}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <img 
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                    className="relative w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover bg-white" 
                    alt="Profile"
                  />
                </div>
             </div>

             {/* Mobile Profile Icon */}
             <div className="lg:hidden" onClick={() => onNavigate(isClient ? 'profile' : 'settings')}>
               <img 
                 src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                 className="w-10 h-10 rounded-2xl border-2 border-white/50 shadow-sm object-cover bg-white" 
                 alt="Profile"
               />
             </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="px-4 lg:px-0 max-w-7xl mx-auto">
          {children}
        </div>

      </main>

      {/* Mobile Bottom Navigation - Vivid App Style */}
      <nav className="fixed bottom-6 inset-x-4 glass-panel-dark rounded-[2.5rem] lg:hidden z-50 shadow-2xl shadow-brand-blue/20">
        <div className="flex justify-between items-center px-6 py-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center gap-1 transition-all duration-300 ${
                currentView === item.id ? 'text-brand-blue -translate-y-2' : 'text-neutral-medium'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${
                currentView === item.id 
                  ? 'bg-gradient-to-tr from-brand-blue to-brand-purple text-white shadow-lg shadow-brand-blue/40' 
                  : 'hover:bg-blue-50'
              }`}>
                <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
              </div>
              {currentView === item.id && (
                <span className="absolute -bottom-5 text-[10px] font-bold tracking-wide animate-fade-in-up text-brand-blue">
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Floating Action Button (Client Only) */}
      {isClient && (
        <button className="fixed bottom-32 right-6 lg:hidden w-16 h-16 btn-liquid rounded-full flex items-center justify-center z-40 active:scale-90 transition-transform text-white">
          <Plus size={32} />
        </button>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/80 backdrop-blur-sm" onClick={() => setIsCancelModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-status-error rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-extrabold text-neutral-dark text-center mb-2">Cancelar Conta?</h3>
            <p className="text-neutral-medium text-center mb-6">
              Tem a certeza de que deseja cancelar a conta? Esta ação não pode ser desfeita. Os seus dados serão mantidos por 30 dias.
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

export default Layout;