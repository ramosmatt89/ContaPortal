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
  
  // Invitation State
  const [pendingInviteClient, setPendingInviteClient] = useState<Client | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

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

  // --- TOKEN VALIDATION LOGIC ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Find client with this token across all accountants
      let foundClient: Client | null = null;
      let accountantId: string | null = null;

      Object.keys(dataDB).forEach(accId => {
        const client = dataDB[accId].find(c => c.inviteToken === token);
        if (client) {
          foundClient = client;
          accountantId = accId;
        }
      });

      if (foundClient && accountantId) {
        const client = foundClient as Client;
        
        // 1. Check Expiration
        if (client.inviteExpires && new Date(client.inviteExpires) < new Date()) {
          setInviteError("Este convite expirou. Solicite um novo ao seu contabilista.");
        } 
        // 2. Check Status
        else if (client.status !== 'PENDING' && client.status !== 'INVITED') {
           // If already active, maybe redirect to login normally or show message
           setInviteError("Este convite já foi utilizado.");
        } else {
           // Valid Invite
           setPendingInviteClient(client);
        }
      } else {
        setInviteError("Convite inválido ou não encontrado.");
      }
      
      // Clear URL to clean up (optional, good for UX)
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [dataDB]);

  // --- AUTH HANDLERS ---

  const handleLogin = (email: string, pass: string, rememberMe: boolean) => {
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      const user = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // Check for Deletion Schedule
        if (user.status === 'INACTIVE') {
           if (user.deletionScheduledAt) {
             const deletionDate = new Date(user.deletionScheduledAt);
             const now = new Date();
             if (now > deletionDate) {
               setAuthError('Esta conta foi eliminada permanentemente.');
               setAuthLoading(false);
               return;
             }
             // Allow Reactivation
             if (window.confirm('A sua conta está desativada e agendada para eliminação. Deseja reativá-la agora?')) {
               const reactivatedUser = { ...user, status: 'ACTIVE' as const, deletionScheduledAt: undefined };
               setUsersDB(prev => prev.map(u => u.id === user.id ? reactivatedUser : u));
               setCurrentUser(reactivatedUser);
               if (rememberMe) localStorage.setItem('cp_currentUser', JSON.stringify(reactivatedUser));
               setCurrentView('dashboard');
               alert('Bem-vindo de volta! A sua conta foi reativada.');
               setAuthLoading(false);
               return;
             } else {
               setAuthError('Conta desativada.');
               setAuthLoading(false);
               return;
             }
           }
        }

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
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        status: 'ACTIVE'
      };

      setUsersDB(prev => [...prev, newUser]);
      if (role === UserRole.ACCOUNTANT) {
        setDataDB(prev => ({ ...prev, [newUser.id]: [] }));
      }

      // Sync Invitation Logic
      if (pendingInviteClient) {
         const accountantId = Object.keys(dataDB).find(accId => 
             dataDB[accId].some(c => c.id === pendingInviteClient.id)
         );

         if (accountantId) {
             const updatedClientList = dataDB[accountantId].map(c => 
                c.id === pendingInviteClient.id 
                  ? { 
                      ...c, 
                      status: 'ACTIVE' as const,
                      inviteToken: undefined,
                      companyName: newUser.name,
                      avatarUrl: newUser.avatarUrl || c.avatarUrl
                    } 
                  : c
             );
             setDataDB(prev => ({ ...prev, [accountantId]: updatedClientList }));
         }
         
         setPendingInviteClient(null);
      } else {
         // Legacy invite matching
         let wasInvited = false;
         const updatedDataDB = { ...dataDB };
         
         Object.keys(updatedDataDB).forEach(accountantId => {
           const accountantClients = updatedDataDB[accountantId];
           const clientIndex = accountantClients.findIndex(c => c.email.toLowerCase() === email.toLowerCase());
           
           if (clientIndex > -1) {
             wasInvited = true;
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

  const handleCancelAccount = () => {
    if (!currentUser) return;
    
    // Schedule deletion for 30 days from now
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    const updatedUser: User = {
       ...currentUser,
       status: 'INACTIVE',
       deletionScheduledAt: deletionDate.toISOString()
    };

    setUsersDB(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    
    // Also logout immediately
    handleLogout();
    
    alert(`A sua conta foi cancelada. Os seus dados serão mantidos por 30 dias (${deletionDate.toLocaleDateString()}), após o qual serão permanentemente eliminados. Pode reativar a conta fazendo login durante este período.`);
  };

  // --- DATA LOGIC ---

  const handleAddClient = (newClient: Client) => {
    if (!currentUser) return;
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

  const handleUploadDocument = (file: File, type: DocType = DocType.INVOICE) => {
    if (!currentUser) return;

    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      title: file.name,
      type: type,
      date: new Date().toISOString(),
      status: DocStatus.PENDING,
      clientId: currentUser.id,
      fileUrl: URL.createObjectURL(file)
    };

    setDocsDB(prev => [newDoc, ...prev]);
    
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

  const handleAddObligation = (obligation: Omit<TaxObligation, 'id'>) => {
    const newObligation: TaxObligation = {
      ...obligation,
      id: `tax_${Date.now()}`
    };
    setObligationsDB(prev => [newObligation, ...prev]);
  };

  const handleApproveObligation = (id: string) => {
    setObligationsDB(prev => prev.map(o => o.id === id ? { ...o, status: 'PAID' } : o));
  };

  const getBranding = () => {
    const defaultBranding = { name: 'ContaPortal', logo: '' };
    if (!currentUser) return defaultBranding;

    if (currentUser.role === UserRole.ACCOUNTANT) {
      return { 
        name: currentUser.name, 
        logo: currentUser.avatarUrl || '' 
      };
    } else if (currentUser.role === UserRole.CLIENT) {
      const allClients = Object.values(dataDB).flat() as Client[];
      const clientRecord = allClients.find(c => c.email === currentUser.email);
      
      if (clientRecord) {
         const accountantId = Object.keys(dataDB).find(accId => 
           dataDB[accId].some(c => c.id === clientRecord.id || c.email === clientRecord.email)
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
        validatedInvite={pendingInviteClient}
        inviteError={inviteError}
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
            const userDocuments = docsDB.filter(d => d.clientId === currentUser.id);
            const userObligations = obligationsDB.filter(o => o.clientId === currentUser.id);

            switch (currentView) {
              case 'dashboard':
                return <DashboardClient user={currentUser} documents={userDocuments} onUpload={handleUploadDocument} accountantName={accountantName} viewMode="dashboard" obligations={userObligations} />;
              case 'documents':
                 return <DashboardClient user={currentUser} documents={userDocuments} onUpload={handleUploadDocument} accountantName={accountantName} viewMode="documents" />;
              case 'authorizations':
                 return <DashboardClient user={currentUser} documents={userDocuments} onUpload={handleUploadDocument} accountantName={accountantName} viewMode="authorizations" obligations={userObligations} onApproveObligation={handleApproveObligation} />;
              case 'profile':
                return <Settings user={currentUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onCancelAccount={handleCancelAccount} />;
              default:
                return <DashboardClient user={currentUser} documents={userDocuments} onUpload={handleUploadDocument} accountantName={accountantName} viewMode="dashboard" />;
            }
          })()
        ) : (
          (() => {
             const myClientEmails = clients.map(c => c.email);
             const myClientIds = clients.map(c => c.id);
             const relevantDocs = docsDB.filter(doc => {
                const docOwnerUser = usersDB.find(u => u.id === doc.clientId);
                return docOwnerUser && myClientEmails.includes(docOwnerUser.email);
             });

            switch (currentView) {
              case 'dashboard':
                return <DashboardAccountant onNavigate={setCurrentView} clients={clients} user={currentUser} documents={relevantDocs} viewMode="overview" onValidate={handleValidateDocument} />;
              case 'documents':
                 return <DashboardAccountant onNavigate={setCurrentView} clients={clients} user={currentUser} documents={relevantDocs} viewMode="documents" onValidate={handleValidateDocument} />;
              case 'clients':
                return <ClientsManagement currentUser={currentUser} clients={clients} onAddClient={handleAddClient} onUpdateClient={handleUpdateClient} onDeleteClient={handleDeleteClient} />;
              case 'settings':
                  return <Settings user={currentUser} onUpdateUser={handleUpdateUser} onLogout={handleLogout} onCancelAccount={handleCancelAccount} />;
              case 'obligations':
                  return <DashboardAccountant onNavigate={setCurrentView} clients={clients} user={currentUser} documents={relevantDocs} viewMode="obligations" onAddObligation={handleAddObligation} obligations={obligationsDB.filter(o => myClientIds.includes(o.clientId) || clients.some(c => c.email === o.clientId))} />;
              default:
                return <DashboardAccountant onNavigate={setCurrentView} clients={clients} user={currentUser} documents={relevantDocs} viewMode="overview" onValidate={handleValidateDocument} />;
            }
          })()
        )}
      </Suspense>
    );
  };

  return (
    <Layout user={currentUser} currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} onCancelAccount={handleCancelAccount} branding={branding}>
      {renderContent()}
    </Layout>
  );
};

export default App;