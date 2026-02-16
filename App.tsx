import React, { useState, Suspense, lazy, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { UserRole, Client, User, Document, DocStatus, DocType, TaxObligation } from './types';

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

  // Load Data Database (Clients linked to Accountants)
  const [dataDB, setDataDB] = useState<Record<string, Client[]>>(() => {
    const saved = localStorage.getItem('cp_dataDB');
    return saved ? JSON.parse(saved) : {};
  });

  // Load Documents Database
  const [docsDB, setDocsDB] = useState<Document[]>(() => {
    const saved = localStorage.getItem('cp_docsDB');
    return saved ? JSON.parse(saved) : [];
  });

  // Load Obligations Database
  const [obligationsDB, setObligationsDB] = useState<TaxObligation[]>(() => {
    const saved = localStorage.getItem('cp_obligationsDB');
    return saved ? JSON.parse(saved) : [];
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
    if (currentUser && currentUser.role === UserRole.ACCOUNTANT) {
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

      setUsersDB(prev => [...prev, newUser]);
      if (role === UserRole.ACCOUNTANT) {
        setDataDB(prev => ({ ...prev, [newUser.id]: [] }));
      }

      // Sync Invitation Logic: If this user was invited as a client, activate them in the accountant's list
      let wasInvited = false;
      const updatedDataDB = { ...dataDB };
      
      Object.keys(updatedDataDB).forEach(accountantId => {
        const accountantClients = updatedDataDB[accountantId];
        const clientIndex = accountantClients.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
        
        if (clientIndex > -1) {
          wasInvited = true;
          // Sync profile data to the accountant's view
          updatedDataDB[accountantId][clientIndex] = {
             ...updatedDataDB[accountantId][clientIndex],
             status: 'ACTIVE',
             companyName: newUser.name,
             avatarUrl: newUser.avatarUrl || updatedDataDB[accountantId][clientIndex].avatarUrl
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

  // --- DATA LOGIC ---

  const handleAddClient = (newClient: Client) => {
    if (!currentUser) return;
    // Ensure we use the current user's ID as the accountant ID
    const clientWithAccountant = { ...newClient, accountantId: currentUser.id };
    const updatedClients = [clientWithAccountant, ...clients];
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

      // If Client, update Accountant's view
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
        if (found) setDataDB(updatedDataDB);
      }
    }
  };

  // Upload Logic (Used by Client)
  const handleUploadDocument = (file: File, type: DocType = DocType.INVOICE) => {
    if (!currentUser) return;

    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      title: file.name,
      type: type,
      date: new Date().toISOString(),
      status: DocStatus.PENDING,
      clientId: currentUser.id, // Links doc to the specific user ID
      fileUrl: URL.createObjectURL(file)
    };

    setDocsDB(prev => [newDoc, ...prev]);
    
    // Increment 'pendingDocs' count in the Accountant's client list
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

  // Validation Logic (Used by Accountant)
  const handleValidateDocument = (docId: string, newStatus: DocStatus) => {
    const docToUpdate = docsDB.find(d => d.id === docId);
    if (!docToUpdate) return;

    setDocsDB(prev => prev.map(d => d.id === docId ? { ...d, status: newStatus } : d));

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

  // Create Tax Obligation (Used by Accountant)
  const handleAddObligation = (obligation: Omit<TaxObligation, 'id'>) => {
    const newObligation: TaxObligation = {
      ...obligation,
      id: `tax_${Date.now()}`
    };
    setObligationsDB(prev => [newObligation, ...prev]);
  };

  // Pay/Approve Obligation (Used by Client)
  const handleApproveObligation = (id: string) => {
    setObligationsDB(prev => prev.map(o => o.id === id ? { ...o, status: 'PAID' } : o));
  };

  // --- BRANDING ---
  const getBranding = () => {
    const defaultBranding = { name: 'ContaPortal', logo: '' };
    if (!currentUser) return defaultBranding;

    if (currentUser.role === UserRole.ACCOUNTANT) {
      // Accountant sees their own brand set in Settings
      return { 
        name: currentUser.name, 
        logo: currentUser.avatarUrl || '' 
      };
    } else if (currentUser.role === UserRole.CLIENT) {
      // Client sees their Accountant's brand
      // Find the accountant who owns this client
      const allClients = Object.values(dataDB).flat() as Client[];
      const clientRecord = allClients.find(c => c.email === currentUser.email);
      
      if (clientRecord) {
         const accountantId = Object.keys(dataDB).find(accId => 
           dataDB[accId].some(c => c.id === clientRecord.id)
         );
         
         if (accountantId) {
           const accountantUser = usersDB.find(u => u.id === accountantId);
           if (accountantUser) {
             return {
               name: accountantUser.name,
               logo: accountantUser.avatarUrl || ''
             };
           }
         }
      }
    }
    return defaultBranding;
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

  const branding = getBranding();

  const renderContent = () => {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {currentUser.role === UserRole.CLIENT ? (
          (() => {
            const accountantName = branding.name === 'ContaPortal' ? 'O Seu Contabilista' : branding.name;
            // Filter docs for THIS client
            const userDocuments = docsDB.filter(d => d.clientId === currentUser.id);
            // Filter obligations for THIS client
            // We need to map currentUser -> Client Record -> ID used in obligations
            // Currently simplified: currentUser.id IS the clientId in docs, but obligations need to match logic.
            // In handleAddObligation, we will store the Client ID from the Accountant's list. 
            // We need to ensure we find the correct ID correspondence. 
            // For now, let's assume obligationsDB stores the Accountant's Client ID reference.
            // Ideally, we find the client record in dataDB to get the ID.
            
            let myClientId = currentUser.id; // Default
            // Try to find if I am listed in an accountant's DB with a different ID (unlikely in this simplified model, but good practice)
            
            const userObligations = obligationsDB.filter(o => o.clientId === myClientId || o.clientId === currentUser.email); // Fallback to email matching if needed

            switch (currentView) {
              case 'dashboard':
                return (
                  <DashboardClient 
                    user={currentUser} 
                    documents={userDocuments}
                    onUpload={handleUploadDocument}
                    accountantName={accountantName}
                    viewMode="dashboard"
                    obligations={userObligations}
                  />
                );
              case 'documents':
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
                 return (
                  <DashboardClient 
                    user={currentUser} 
                    documents={userDocuments}
                    onUpload={handleUploadDocument}
                    accountantName={accountantName}
                    viewMode="authorizations"
                    obligations={userObligations}
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
             // Accountant View
             // Get only docs from my clients
             const myClientEmails = clients.map(c => c.email);
             const myClientIds = clients.map(c => c.id);
             
             // Get Docs belonging to my clients (Match by User ID -> Client Record -> Email/ID)
             // Simplified: We need to map Doc.clientId (User ID) to verify it is one of my clients.
             const relevantDocs = docsDB.filter(doc => {
                const docOwnerUser = usersDB.find(u => u.id === doc.clientId);
                return docOwnerUser && myClientEmails.includes(docOwnerUser.email);
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
                  return (
                    <DashboardAccountant 
                      onNavigate={setCurrentView} 
                      clients={clients} 
                      user={currentUser}
                      documents={relevantDocs}
                      viewMode="obligations" // Reuse dashboard component with specific mode
                      onAddObligation={handleAddObligation}
                      obligations={obligationsDB.filter(o => myClientIds.includes(o.clientId) || clients.some(c => c.email === o.clientId))}
                    />
                  );
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
      branding={branding}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;