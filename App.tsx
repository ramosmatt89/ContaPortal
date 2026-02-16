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
  // --- STATE INITIALIZATION WITH PERSISTENCE ---

  // Load User Database from LocalStorage or initialize empty
  const [usersDB, setUsersDB] = useState<User[]>(() => {
    const saved = localStorage.getItem('cp_usersDB');
    return saved ? JSON.parse(saved) : [];
  });

  // Load Data Database (Clients) from LocalStorage
  const [dataDB, setDataDB] = useState<Record<string, Client[]>>(() => {
    const saved = localStorage.getItem('cp_dataDB');
    return saved ? JSON.parse(saved) : {};
  });

  // Load Current Session
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cp_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>([]);

  // --- PERSISTENCE EFFECTS ---

  // Save Users DB whenever it changes
  useEffect(() => {
    localStorage.setItem('cp_usersDB', JSON.stringify(usersDB));
  }, [usersDB]);

  // Save Data DB whenever it changes
  useEffect(() => {
    localStorage.setItem('cp_dataDB', JSON.stringify(dataDB));
  }, [dataDB]);

  // Load Clients for the current user when logged in
  useEffect(() => {
    if (currentUser) {
      const userClients = dataDB[currentUser.id] || [];
      setClients(userClients);
    } else {
      setClients([]);
    }
  }, [currentUser, dataDB]);

  // --- AUTH HANDLERS ---

  const handleLogin = (email: string, pass: string, rememberMe: boolean) => {
    setAuthLoading(true);
    setAuthError(null);

    // Simulate API Delay
    setTimeout(() => {
      const user = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // Simple mock password check
        if (pass.length >= 4) { 
          setCurrentUser(user);
          
          // Persistence Logic
          if (rememberMe) {
            localStorage.setItem('cp_currentUser', JSON.stringify(user));
          } else {
            // For session-only, we could use sessionStorage, but for this prototype
            // we will just set state. If user refreshes without rememberMe, they lose session.
            // However, the initial state logic above reads from localStorage.
            // To support non-persistence, we'd need to clear localStorage on window close, 
            // which is tricky in React. 
            // For this 'SaaS' prototype, we'll treat "Remember Me" as "Persist to LocalStorage".
            // If not checked, we won't save to LS (or remove it if it was there).
            localStorage.removeItem('cp_currentUser'); 
          }

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

      // Update State (Effect handles persistence)
      setUsersDB(prev => [...prev, newUser]);
      setDataDB(prev => ({ ...prev, [newUser.id]: [] }));
      
      // Auto Login & Persist by default on register for better UX
      setCurrentUser(newUser);
      localStorage.setItem('cp_currentUser', JSON.stringify(newUser));
      
      setCurrentView('dashboard');
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem('cp_currentUser');
    setCurrentUser(null);
    setClients([]);
    setCurrentView('dashboard');
  };

  // --- DATA HANDLERS ---

  const handleAddClient = (newClient: Client) => {
    if (!currentUser) return;
    
    // Update Local State
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    
    // Update DB State (Effect handles persistence)
    setDataDB(prev => ({
      ...prev,
      [currentUser.id]: updatedClients
    }));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    if (!currentUser) return;

    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    
    setDataDB(prev => ({
      ...prev,
      [currentUser.id]: updatedClients
    }));
  };

  const handleDeleteClient = (id: string) => {
    if (!currentUser) return;

    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    
    setDataDB(prev => ({
      ...prev,
      [currentUser.id]: updatedClients
    }));
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      
      // Update in stored DB
      setUsersDB(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      
      // Update persistent session if it exists
      if (localStorage.getItem('cp_currentUser')) {
        localStorage.setItem('cp_currentUser', JSON.stringify(updatedUser));
      }
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