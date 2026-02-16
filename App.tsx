import React, { useState, Suspense, lazy, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { UserRole, Client, User, Document, DocStatus, DocType, TaxObligation } from './types';
import { DEMO_OBLIGATIONS } from './constants';

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

  // Load User Database
  const [usersDB, setUsersDB] = useState<User[]>(() => {
    const saved = localStorage.getItem('cp_usersDB');
    return saved ? JSON.parse(saved) : [];
  });

  // Load Data Database (Clients)
  const [dataDB, setDataDB] = useState<Record<string, Client[]>>(() => {
    const saved = localStorage.getItem('cp_dataDB');
    return saved ? JSON.parse(saved) : {};
  });

  // Load Documents Database
  const [docsDB, setDocsDB] = useState<Document[]>(() => {
    const saved = localStorage.getItem('cp_docsDB');
    return saved ? JSON.parse(saved) : [];
  });

  // Load Obligations Database (NEW for "Validar" tab)
  const [obligationsDB, setObligationsDB] = useState<TaxObligation[]>(() => {
    const saved = localStorage.getItem('cp_obligationsDB');
    // Seed with demo data if empty for demonstration purposes
    return saved ? JSON.parse(saved) : DEMO_OBLIGATIONS;
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

  useEffect(() => { localStorage.setItem('cp_usersDB', JSON.stringify(usersDB)); }, [usersDB]);
  useEffect(() => { localStorage.setItem('cp_dataDB', JSON.stringify(dataDB)); }, [dataDB]);
  useEffect(() => { localStorage.setItem('cp_docsDB', JSON.stringify(docsDB)); }, [docsDB]);
  useEffect(() => { localStorage.setItem('cp_obligationsDB', JSON.stringify(obligationsDB)); }, [obligationsDB]);

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

    setTimeout(() => {
      const user = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        if (pass.length >= 4) { 
          setCurrentUser(user);
          if (rememberMe) localStorage.setItem('cp_currentUser', JSON.stringify(user));
          else localStorage.removeItem('cp_currentUser'); 
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

      // 1. Create User
      setUsersDB(prev => [...prev, newUser]);
      setDataDB(prev => ({ ...prev, [newUser.id]: [] })); 

      // 2. Sync Invitation Status AND Profile Data
      let wasInvited = false;
      const updatedDataDB = { ...dataDB };
      
      Object.keys(updatedDataDB).forEach(accountantId => {
        const accountantClients = updatedDataDB[accountantId];
        const clientIndex = accountantClients.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
        
        if (clientIndex > -1) {
          wasInvited = true;
          // IMPORTANT: Here we update not just status, but the name and avatar 
          // to match what the client just registered with.
          updatedDataDB[accountantId][clientIndex] = {
             ...updatedDataDB[accountantId][clientIndex],
             status: 'ACTIVE',
             companyName: newUser.name, // Sync registered name
             avatarUrl: newUser.avatarUrl || updatedDataDB[accountantId][clientIndex].avatarUrl // Sync avatar
          };
        }
      });

      if (wasInvited) {
        setDataDB(updatedDataDB);
      }
      
      setCurrentUser(newUser);
      localStorage.setItem('cp_currentUser', JSON.stringify(newUser));
      setCurrentView('dashboard');
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem('cp_currentUser');
    setCurrentUser(null);
    setClients([]);
    setCurrentView('dashboard');
  };

  // --- DATA HANDLERS ---

  const handleAddClient = (newClient: Client) => {
    if (!currentUser) return;
    const updatedClients = [newClient, ...clients];
    setClients(updatedClients);
    setDataDB(prev => ({ ...prev, [currentUser.id]: updatedClients }));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    if (!currentUser) return;
    const updatedClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
    setClients(updatedClients);
    setDataDB(prev => ({ ...prev, [currentUser.id]: updatedClients }));
  };

  const handleDeleteClient = (id: string) => {
    if (!currentUser) return;
    const updatedClients = clients.filter(c => c.id !== id);
    setClients(updatedClients);
    setDataDB(prev => ({ ...prev, [currentUser.id]: updatedClients }));
  };

  const handleUpdateUser = (updatedData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedData };
      setCurrentUser(updatedUser);
      setUsersDB(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      if (localStorage.getItem('cp_currentUser')) {
        localStorage.setItem('cp_currentUser', JSON.stringify(updatedUser));
      }

      // If this user is a CLIENT, we must also update the ACCOUNTANT's view (dataDB)
      // to ensure the accountant sees the new logo/name immediately.
      if (currentUser.role === UserRole.CLIENT) {
        const updatedDataDB = { ...dataDB };
        let found = false;

        Object.keys(updatedDataDB).forEach(accId => {
           const clientList = updatedDataDB[accId];
           const clientIdx = clientList.findIndex(c => c.email === currentUser.email);
           if (clientIdx > -1) {
              updatedDataDB[accId][clientIdx] = {
                 ...clientList[clientIdx],
                 companyName: updatedData.name || clientList[clientIdx].companyName,
                 avatarUrl: updatedData.avatarUrl || clientList[clientIdx].avatarUrl
              };
              found = true;
           }
        });

        if (found) {
           setDataDB(updatedDataDB);
        }
      }
    }
  };

  const handleUploadDocument = (file: File) => {
    if (!currentUser) return;

    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      title: file.name,
      type: DocType.INVOICE,
      date: new Date().toISOString(),
      status: DocStatus.PENDING,
      clientId: currentUser.id,
      fileUrl: URL.createObjectURL(file)
    };

    setDocsDB(prev => [newDoc, ...prev]);
    
    // Update pending count for client record
    const allClients = Object.values(dataDB).flat() as Client[];
    const clientRecord = allClients.find(c => c.email === currentUser.email);
    
    if (clientRecord) {
       const accountantId = Object.keys(dataDB).find(accId => 
         dataDB[accId].some(c => c.id === clientRecord.id)
       );
       if (accountantId) {
          const updatedClientList = dataDB[accountantId].map(c => 
            c.id === clientRecord.id ? { ...c, pendingDocs: c.pendingDocs + 1 } : c
          );
          setDataDB(prev => ({ ...prev, [accountantId]: updatedClientList }));
       }
    }
  };

  const handleValidateDocument = (docId: string, newStatus: DocStatus) => {
    // 1. Update Document Status
    const docToUpdate = docsDB.find(d => d.id === docId);
    if (!docToUpdate) return;

    // Direct state update ensures reactivity across re-renders
    setDocsDB(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));

    // 2. Decrement Client Pending Count
    if (newStatus !== DocStatus.PENDING) {
        const docOwnerUser = usersDB.find(u => u.id === docToUpdate.clientId);
        if (docOwnerUser) {
             const accountantId = currentUser?.id; 
             if (accountantId && dataDB[accountantId]) {
                 const updatedClientList = dataDB[accountantId].map(c => {
                    if (c.email === docOwnerUser.email && c.pendingDocs > 0) {
                        return { ...c, pendingDocs: c.pendingDocs - 1 };
                    }
                    return c;
                 });
                 setDataDB(prev => ({ ...prev, [accountantId]: updatedClientList }));
                 setClients(updatedClientList);
             }
        }
    }
  };

  // Handler for Client to "Pay" or "Validate" an obligation
  const handleApproveObligation = (id: string) => {
    setObligationsDB(prev => prev.map(o => o.id === id ? { ...o, status: 'PAID' } : o));
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
            // Find Accountant Name
            const allClients = Object.values(dataDB).flat() as Client[];
            const clientRecord = allClients.find(c => c.email === currentUser.email);
            let accountantName = "O Seu Contabilista";
            
            if (clientRecord) {
               const accountantId = Object.keys(dataDB).find(accId => 
                 dataDB[accId].some(c => c.id === clientRecord.id)
               );
               const accountantUser = usersDB.find(u => u.id === accountantId);
               if (accountantUser) accountantName = accountantUser.name;
            }

            const userDocuments = docsDB.filter(d => d.clientId === currentUser.id);

            // Client Routing
            switch (currentView) {
              case 'dashboard':
                return (
                  <DashboardClient 
                    user={currentUser} 
                    documents={userDocuments}
                    onUpload={handleUploadDocument}
                    accountantName={accountantName}
                    viewMode="dashboard"
                  />
                );
              case 'documents':
                 // Fix: Show the dedicated documents list
                 return (
                  <DashboardClient 
                    user={currentUser} 
                    documents={userDocuments}
                    onUpload={handleUploadDocument}
                    accountantName={accountantName}
                    viewMode="documents"
                  />
                 );
              case 'authorizations':
                 // Fix: Show the Obligations/Validation tab
                 return (
                  <DashboardClient 
                    user={currentUser} 
                    documents={userDocuments}
                    onUpload={handleUploadDocument}
                    accountantName={accountantName}
                    viewMode="authorizations"
                    obligations={obligationsDB}
                    onApproveObligation={handleApproveObligation}
                  />
                 );
              case 'profile':
                return <Settings user={currentUser} onUpdateUser={handleUpdateUser} />;
              default:
                return (
                  <DashboardClient 
                    user={currentUser} 
                    documents={userDocuments}
                    onUpload={handleUploadDocument}
                    accountantName={accountantName}
                    viewMode="dashboard"
                  />
                );
            }
          })()
        ) : (
          (() => {
             // Accountant Logic
             const myClientEmails = clients.map(c => c.email);
             
             const relevantDocs = docsDB.filter(doc => {
                const docOwner = usersDB.find(u => u.id === doc.clientId);
                return docOwner && myClientEmails.includes(docOwner.email);
             });

            switch (currentView) {
              case 'dashboard':
                return (
                  <DashboardAccountant 
                    onNavigate={setCurrentView} 
                    clients={clients} 
                    user={currentUser}
                    documents={relevantDocs}
                    viewMode="overview"
                    onValidate={handleValidateDocument}
                  />
                );
              case 'documents':
                 return (
                  <DashboardAccountant 
                    onNavigate={setCurrentView} 
                    clients={clients} 
                    user={currentUser}
                    documents={relevantDocs}
                    viewMode="documents"
                    onValidate={handleValidateDocument}
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
              case 'obligations':
                  return <div className="p-10 text-center text-slate-500 glass-panel rounded-2xl">Gestão de Obrigações em construção 🚧</div>;
              default:
                return (
                  <DashboardAccountant 
                    onNavigate={setCurrentView} 
                    clients={clients} 
                    user={currentUser}
                    documents={relevantDocs}
                    viewMode="overview"
                    onValidate={handleValidateDocument}
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