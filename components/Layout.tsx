import React from 'react';
import { UserRole } from '../types';
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
  Menu
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, role, currentView, onNavigate, onLogout }) => {
  const isClient = role === UserRole.CLIENT;

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-neutral-dark selection:bg-brand-blue selection:text-white">
      
      {/* Desktop Sidebar - Floating Glass Style */}
      <aside className="hidden lg:flex flex-col fixed inset-y-4 left-4 w-72 glass-panel-dark rounded-[2rem] z-50">
        <div className="p-8 pb-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-purple shadow-lg shadow-brand-blue/30 flex items-center justify-center text-white font-bold text-xl">
            C
          </div>
          <span className="text-2xl font-bold tracking-tight text-neutral-dark">
            ContaPortal
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

        <div className="p-4 mx-4 mb-4 border-t border-neutral-light/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-3 text-neutral-medium hover:text-status-error hover:bg-red-50/50 rounded-2xl transition-all duration-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 relative pb-28 lg:pb-8 lg:pr-4 lg:pt-4">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 lg:relative lg:top-auto px-4 py-4 lg:px-0 lg:py-0 flex justify-between items-center mb-6 lg:mb-10 transition-all duration-300">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 glass-panel px-4 py-2 rounded-2xl">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-purple flex items-center justify-center text-white font-bold text-lg shadow-md">
              C
            </div>
            <h1 className="font-bold text-lg text-neutral-dark tracking-tight">ContaPortal</h1>
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

          {/* User Profile */}
          <div className="flex items-center gap-3 lg:gap-5">
             <button className="relative p-3 rounded-2xl glass-panel hover:bg-white transition-all active:scale-95 group hover:shadow-lg hover:shadow-brand-blue/10">
              <Bell size={22} className="text-neutral-medium group-hover:text-brand-blue transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-status-error rounded-full border-2 border-white shadow-sm animate-pulse"></span>
             </button>
             
             <div className="hidden lg:flex items-center gap-4 pl-4 border-l border-neutral-light/50">
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-dark">{isClient ? 'João Silva' : 'Dr. Mário Contas'}</p>
                  <p className="text-xs font-medium text-neutral-medium">{isClient ? 'TechSolutions Lda' : 'Contabilista Sénior'}</p>
                </div>
                <div className="relative group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity"></div>
                  <img 
                    src={`https://picsum.photos/seed/${role}/100`} 
                    className="relative w-12 h-12 rounded-2xl border-2 border-white shadow-sm object-cover" 
                    alt="Profile"
                    loading="lazy"
                    width="48"
                    height="48"
                    decoding="async"
                  />
                </div>
             </div>

             {/* Mobile Profile Icon */}
             <div className="lg:hidden">
               <img 
                 src={`https://picsum.photos/seed/${role}/100`} 
                 className="w-10 h-10 rounded-2xl border-2 border-white/50 shadow-sm" 
                 alt="Profile"
                 loading="lazy"
                 width="40"
                 height="40"
                 decoding="async"
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

    </div>
  );
};

export default Layout;