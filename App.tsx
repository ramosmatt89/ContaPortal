import React, { useState, Suspense, lazy, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { UserRole, Client, User } from './types';
import { DEMO_CLIENTS } from './constants';

// Lazy loading heavy dashboard components
const DashboardClient = lazy(() => import('./components/DashboardClient'));
const DashboardAccountant = lazy(() => import('./components/DashboardAccountant'));
const ClientsManagement = lazy(() => import('./components/ClientsManagement'));
const Settings = lazy(() => import('./components/Settings'));

// Lightweight loading component
const LoadingFallback = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-neutral-light"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-brand-blue border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data State (Isolated per User)
  const [clients, setClients] = useState<Client[]>([]);

  // Simulated Database (In a real app, this is Backend)
  // We keep a record of all registered users in session memory to allow logout/login
  const [usersDB, setUsersDB] = useState<User[]>([
    // Add a demo user for testing if needed, or keep empty
  ]);
  
  // Map of UserID -> Client[]
  const [dataDB, setDataDB] = useState<Record<string, Client[]>>({
    // 'demo_id': DEMO_CLIENTS (Removed global mock as requested, strictly per user now)
  });

  const handleLogin = (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);

    // Simulate API Delay
    setTimeout(() => {
      const user = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // Simple mock password check (in real app, use hashed passwords)
        if (pass.length >= 4) { 
          setCurrentUser(user);
          // Load User Data
          setClients(dataDB[user.id] || []);
          setCurrentView('dashboard');
        } else {
          setAuthError('Palavra-passe incorreta.');
        }
      } else {
        setAuthError('Utilizador não encontrado. Registe-se para começar.');
      }
      setAuthLoading(false);
    }, 1000);
  };

  const handleRegister = (name: string, email: string, pass: string, role: UserRole) => {
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      const exists = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setAuthError('Este email já está registado.');
        setAuthLoading(false);
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        name,
        email,
        role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };

      // Save to "DB"
      setUsersDB([...usersDB, newUser]);
      // Initialize Empty Data for new user
      setDataDB({ ...dataDB, [newUser.id]: [] });
      
      // Auto Login
      setCurrentUser(newUser);
      setClients([]);
      setCurrentView('dashboard');
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    // Persist current state to "DB" before leaving
    if (currentUser) {
      setDataDB({ ...dataDB, [currentUser.id]: clients });
    }
    setCurrentUser(null);
    setClients([]);
    setCurrentView('dashboard');
  };

  // Client CRUD Operations
  const handleAddClient = (newClient: Client) => {
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    // Update "DB" immediately
    if (currentUser) {
       setDataDB({ ...dataDB, [currentUser.id]: updatedClients });
    }
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    if (currentUser) {
       setDataDB({ ...dataDB, [currentUser.id]: updatedClients });
    }
  };

  const handleDeleteClient = (id: string) => {
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    if (currentUser) {
       setDataDB({ ...dataDB, [currentUser.id]: updatedClients });
    }
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      // Update in DB
      setUsersDB(usersDB.map(u => u.id === currentUser.id ? updatedUser : u));
    }
  };

  if (!currentUser) {
    return (
      <Login 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
        isLoading={authLoading}
        error={authError}
        setError={setAuthError}
      />
    );
  }

  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {currentUser.role === UserRole.CLIENT ? (
          (() => {
            switch (currentView) {
              case 'dashboard':
                return <DashboardClient />;
              case 'profile':
                return <Settings user={currentUser} onUpdateUser={handleUpdateUser} />;
              default:
                 // Fallback for demo purposes as Client view is less developed in this prompt
                return <DashboardClient />;
            }
          })()
        ) : (
          (() => {
            switch (currentView) {
              case 'dashboard':
                return (
                  <DashboardAccountant 
                    onNavigate={setCurrentView} 
                    clients={clients} 
                    user={currentUser}
                  />
                );
              case 'clients':
                return (
                  <ClientsManagement 
                    clients={clients} 
                    onAddClient={handleAddClient}
                    onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient}
                  />
                );
              case 'settings':
                  return <Settings user={currentUser} onUpdateUser={handleUpdateUser} />;
              case 'documents':
                return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Validação em Lote em construção 🚧</div>;
              case 'obligations':
                  return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Gestão de Obrigações em construção 🚧</div>;
              default:
                return (
                  <DashboardAccountant 
                    onNavigate={setCurrentView} 
                    clients={clients} 
                    user={currentUser}
                  />
                );
            }
          })()
        )}
      </Suspense>
    );
  };

  return (
    <Layout 
      user={currentUser}
      currentView={currentView} 
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;