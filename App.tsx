import React, { useState, Suspense, lazy } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { UserRole, Client } from './types';

// Lazy loading heavy dashboard components to reduce initial bundle size
const DashboardClient = lazy(() => import('./components/DashboardClient'));
const DashboardAccountant = lazy(() => import('./components/DashboardAccountant'));
const ClientsManagement = lazy(() => import('./components/ClientsManagement'));

// Lightweight loading component matching the glass design
const LoadingFallback = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-neutral-light"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [currentView, setCurrentView] = useState('dashboard');
  
  // State for Accountant Data (Session Isolated)
  // Initially empty to satisfy requirements: "Ao criar nova conta, dashboard vazio"
  const [clients, setClients] = useState<Client[]>([]);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setCurrentView('dashboard');
    // If we wanted to simulate a recurring user, we could load data here.
    // For now, we stick to the prompt: Accountant starts with empty state.
    if (selectedRole === UserRole.ACCOUNTANT) {
      setClients([]); 
    }
  };

  const handleLogout = () => {
    setRole(UserRole.NONE);
    setClients([]); // Clear session data
  };

  // Client CRUD Operations
  const handleAddClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  if (role === UserRole.NONE) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {role === UserRole.CLIENT ? (
          (() => {
            switch (currentView) {
              case 'dashboard':
                return <DashboardClient />;
              case 'documents':
                return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Arquivo Digital em construção 🚧</div>;
              case 'authorizations':
                return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Autorizações de Pagamento em construção 🚧</div>;
              case 'profile':
                return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Perfil da Empresa em construção 🚧</div>;
              default:
                return <DashboardClient />;
            }
          })()
        ) : (
          (() => {
            switch (currentView) {
              case 'dashboard':
                return <DashboardAccountant onNavigate={setCurrentView} clients={clients} />;
              case 'clients':
                return <ClientsManagement 
                  clients={clients} 
                  onAddClient={handleAddClient}
                  onUpdateClient={handleUpdateClient}
                  onDeleteClient={handleDeleteClient}
                />;
              case 'documents':
                return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Validação em Lote em construção 🚧</div>;
              case 'obligations':
                  return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Gestão de Obrigações em construção 🚧</div>;
              case 'settings':
                  return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Configurações do Escritório em construção 🚧</div>;
              default:
                return <DashboardAccountant onNavigate={setCurrentView} clients={clients} />;
            }
          })()
        )}
      </Suspense>
    );
  };

  return (
    <Layout 
      role={role} 
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;