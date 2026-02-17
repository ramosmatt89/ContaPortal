import React, { useState } from 'react';
import { Client, User } from '../types';
import { 
  Search, 
  Plus, 
  Mail, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Loader2, 
  Send,
  Copy,
  User as UserIcon,
  MoreVertical,
  ShieldAlert,
  Clock,
  ExternalLink,
  Smartphone,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface ClientsManagementProps {
  currentUser: User; 
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const ClientsManagement: React.FC<ClientsManagementProps> = ({ 
  currentUser,
  clients, 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Note: generatedLink and previewClient are no longer used for the initial invite flow
  // as per the requirement to send email in background immediately.
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [previewClient, setPreviewClient] = useState<any>(null); 
  
  // Toast state for actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [newClient, setNewClient] = useState({
    companyName: '',
    nif: '',
    email: '',
    contactPerson: ''
  });

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.nif.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };

  // --- Stateless Token Generation ---
  const generateSecureInvite = (data: { companyName: string, email: string, contactPerson: string }) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // 7 Days Expiration

    const payload = {
      nm: data.companyName,
      em: data.email,
      cp: data.contactPerson,
      an: currentUser.name,
      aid: currentUser.id,
      exp: expires.getTime()
    };

    const token = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    return { token, expires: expires.toISOString() };
  };

  const getLinkFromToken = (token: string) => {
    const url = new URL(window.location.href);
    url.search = ''; 
    url.searchParams.set('token', token);
    return url.toString();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const alreadyExists = clients.some(c => {
      const emailExists = c.email.toLowerCase() === newClient.email.toLowerCase();
      const nifExists = newClient.nif ? c.nif === newClient.nif : false;
      return emailExists || nifExists;
    });

    if (alreadyExists) {
      alert("Já existe um cliente com este Email ou NIF.");
      return;
    }

    setIsLoading(true);

    const { token, expires } = generateSecureInvite({
      companyName: newClient.companyName,
      email: newClient.email,
      contactPerson: newClient.contactPerson
    });

    // Simulate Backend Email Sending Process
    setTimeout(() => {
      const newId = `c${Date.now()}`;
      
      const createdClient: Client = {
        id: newId,
        companyName: newClient.companyName,
        nif: newClient.nif || '', 
        email: newClient.email,
        contactPerson: newClient.contactPerson,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newClient.companyName)}&background=random`,
        status: 'PENDING',
        pendingDocs: 0,
        accountantId: currentUser.id,
        inviteToken: token,
        inviteExpires: expires
      };

      onAddClient(createdClient);
      
      const link = getLinkFromToken(token);
      
      // --- SIMULAÇÃO DE LOG DE ENVIO DE EMAIL (BACKEND) ---
      console.group("📧 SIMULAÇÃO DE ENVIO DE EMAIL (BACKEND)");
      console.log(`%c[Servidor] Enviando email para: ${newClient.email}`, 'color: #007BFF; font-weight: bold;');
      console.log(`%cAssunto: Convite para acessar o sistema`, 'color: #343A40;');
      console.log(`%cCorpo do Email (HTML):`, 'color: #343A40; font-weight: bold;');
      console.log(`
        <p>Olá ${newClient.contactPerson},</p>
        <p>Você recebeu um convite para acessar o sistema.</p>
        <a href="${link}" 
           style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">
           Aceitar Convite
        </a>
        <p>Se o botão não funcionar, copie e cole este link no navegador: ${link}</p>
      `);
      console.groupEnd();
      
      // Copy link for demo purposes so user can actually use it
      navigator.clipboard.writeText(link).then(() => {
          console.log("%cLink copiado para área de transferência (Demo)", 'color: green');
      }).catch(err => console.error("Erro ao copiar link:", err));

      setIsLoading(false);
      handleCloseModal(); 
      
      showToast(`Convite enviado com sucesso.`);
    }, 2000); 
  };

  const handleResendInvite = (client: Client) => {
    const { token, expires } = generateSecureInvite({
        companyName: client.companyName,
        email: client.email,
        contactPerson: client.contactPerson
    });

    onUpdateClient({
        ...client,
        status: 'PENDING',
        inviteToken: token,
        inviteExpires: expires
    });
    
    // Also copy on resend
    const link = getLinkFromToken(token);
    navigator.clipboard.writeText(link);
    
    showToast(`Novo convite enviado!`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGeneratedLink(null);
    setPreviewClient(null);
    setNewClient({ companyName: '', nif: '', email: '', contactPerson: '' });
  };

  // Kept for backward compatibility
  const handleOpenEmailApp = () => {
    if (!generatedLink || !previewClient) return;
    const subject = `Convite: Acesso ao Portal - ${currentUser.name}`;
    const body = `Olá ${previewClient.contactPerson},\n\nLink: ${generatedLink}`;
    window.location.href = `mailto:${previewClient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const toggleClientStatus = (client: Client) => {
    let newStatus = client.status;
    if (client.status === 'ACTIVE' || client.status === 'PENDING' || client.status === 'OVERDUE') newStatus = 'INACTIVE';
    else if (client.status === 'INACTIVE') newStatus = 'ACTIVE';
    
    if (newStatus !== client.status) {
       onUpdateClient({ ...client, status: newStatus as any });
       showToast(newStatus === 'INACTIVE' ? 'Cliente desativado' : 'Cliente ativado');
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast('Link copiado para a área de transferência');
  }

  const getStatusBadge = (client: Client) => {
    if (client.status === 'PENDING' || client.status === 'INVITED') {
        const isExpired = client.inviteExpires && new Date(client.inviteExpires) < new Date();
        if (isExpired) {
             return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><AlertTriangle size={12}/> Convite Expirado</span>;
        }
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-brand-blue border border-blue-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><Mail size={12}/> Convite Enviado</span>;
    }

    switch (client.status) {
      case 'INACTIVE':
        return <span className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-600 border border-neutral-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><Ban size={12}/> Inativo</span>;
      case 'OVERDUE':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><ShieldAlert size={12}/> Atrasado</span>;
      case 'ACTIVE':
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><CheckCircle size={12}/> Convite Aceito</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-8 relative">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-neutral-dark text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle size={18} className="text-status-success" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Carteira de Clientes</h2>
          <p className="text-neutral-medium text-lg max-w-xl leading-relaxed">
            Gerencie o acesso ao portal. Os clientes recebem um <span className="text-brand-blue font-bold">Convite Seguro (7 dias)</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium group-focus-within:text-brand-blue transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Pesquisar empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-white/50 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 backdrop-blur-md shadow-sm transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-liquid px-6 py-3.5 rounded-2xl text-white font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Plus size={22} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => {
             const isExpired = client.inviteExpires && new Date(client.inviteExpires) < new Date() && client.status === 'PENDING';
             return (
              <div key={client.id} className="glass-panel p-6 rounded-[2rem] relative group hover:-translate-y-1 transition-transform duration-300">
                 
                 <div className="absolute top-6 right-6">
                   {getStatusBadge(client)}
                 </div>

                 <div className="flex items-center gap-4 mb-6">
                   <div className="relative">
                     <img src={client.avatarUrl} alt={client.companyName} className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" />
                     <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                       <div className={`w-3 h-3 rounded-full ${client.status === 'ACTIVE' ? 'bg-status-success' : client.status === 'PENDING' ? 'bg-brand-blue' : 'bg-neutral-medium'}`}></div>
                     </div>
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-neutral-dark leading-tight">{client.companyName}</h3>
                     <p className="text-sm text-neutral-medium font-mono tracking-wide opacity-80">{client.nif || 'N/A'}</p>
                   </div>
                 </div>

                 <div className="bg-white/40 rounded-2xl p-4 mb-6 space-y-3">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white text-neutral-medium flex items-center justify-center shadow-sm">
                       <UserIcon size={14} />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-xs text-neutral-medium font-bold uppercase">Contacto</p>
                       <p className="text-sm font-semibold text-neutral-dark truncate">{client.contactPerson}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white text-neutral-medium flex items-center justify-center shadow-sm">
                       <Mail size={14} />
                     </div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-xs text-neutral-medium font-bold uppercase">Email</p>
                       <p className="text-sm font-semibold text-neutral-dark truncate" title={client.email}>{client.email}</p>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center justify-between pt-2 border-t border-white/50">
                   <span className={`text-xs font-bold ${
                     client.status === 'ACTIVE' ? 'text-status-success' : 
                     isExpired ? 'text-status-error' : 'text-neutral-medium'
                   }`}>
                     {client.status === 'ACTIVE' ? 'Convite Aceito' : isExpired ? 'Token Expirado' : 'Aguardando Registo'}
                   </span>
                   
                   <div className="flex items-center gap-2">
                     {(client.status === 'PENDING' || client.status === 'INVITED') && (
                        <>
                          <button 
                            title="Reenviar Convite"
                            onClick={() => handleResendInvite(client)}
                            className={`p-2 rounded-xl transition-colors ${isExpired ? 'bg-red-50 text-status-error hover:bg-red-100' : 'bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white'}`}
                          >
                            {isExpired ? <RefreshCw size={18} /> : <Send size={18} />}
                          </button>
                        </>
                     )}

                     <button className="p-2 rounded-xl hover:bg-neutral-light text-neutral-medium transition-colors">
                       <MoreVertical size={18} />
                     </button>

                     <button 
                        title={client.status === 'INACTIVE' ? 'Ativar' : 'Desativar'}
                        onClick={() => toggleClientStatus(client)}
                        className={`p-2 rounded-xl transition-colors ${
                          client.status === 'INACTIVE' 
                            ? 'bg-green-50 text-status-success hover:bg-green-100' 
                            : 'bg-neutral-light text-neutral-medium hover:bg-neutral-200'
                        }`}
                      >
                        {client.status === 'INACTIVE' ? <CheckCircle size={18} /> : <Ban size={18} />}
                      </button>
                      
                      <button 
                        title="Remover"
                        onClick={() => {
                           if (window.confirm('Tem a certeza que deseja remover este cliente? Esta ação é irreversível.')) {
                             onDeleteClient(client.id);
                           }
                        }}
                        className="p-2 rounded-xl hover:bg-red-50 text-neutral-medium hover:text-status-error transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                 </div>
              </div>
            );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className="w-20 h-20 bg-neutral-light rounded-3xl flex items-center justify-center mx-auto mb-4 text-neutral-medium/50">
               <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-neutral-dark">Nenhum cliente encontrado</h3>
            <p className="text-neutral-medium">Verifique os filtros ou crie um novo convite.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-md transition-opacity" onClick={handleCloseModal}></div>
          
          <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-fade-in-up overflow-hidden transition-all max-h-[90vh] overflow-y-auto">
              
                <div className="mb-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-blue to-brand-purple shadow-brand-blue/30 flex items-center justify-center text-white mx-auto mb-4">
                     <Mail size={32} />
                  </div>
                  <h3 className="text-3xl font-extrabold text-neutral-dark tracking-tight">
                    Novo Convite
                  </h3>
                  <p className="text-neutral-medium mt-2 max-w-xs mx-auto leading-relaxed">
                    Preencha os dados abaixo. Um e-mail automático será gerado.
                  </p>
                </div>
                
                <form onSubmit={handleInvite} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">Nome da Empresa <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="companyName"
                      required
                      value={newClient.companyName}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-neutral-light focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 text-neutral-dark font-medium transition-all"
                      placeholder="Ex: Tech Solutions Lda"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">Pessoa de Contacto <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="contactPerson"
                      required
                      value={newClient.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-neutral-light focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 text-neutral-dark font-medium transition-all"
                      placeholder="Ex: João Silva"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">NIF (Opcional)</label>
                      <input 
                        type="text" 
                        name="nif"
                        pattern="[0-9]{8}"
                        maxLength={8}
                        title="O NIF deve ter 8 dígitos"
                        value={newClient.nif}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-neutral-light focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 text-neutral-dark font-medium transition-all"
                        placeholder="12345678"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">Email <span className="text-red-500">*</span></label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        value={newClient.email}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 rounded-2xl bg-white border border-neutral-light focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 text-neutral-dark font-medium transition-all"
                        placeholder="mail@exemplo.com"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleCloseModal}
                      className="flex-1 py-4 rounded-2xl font-bold text-neutral-medium hover:bg-neutral-light transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex-1 py-4 rounded-2xl font-bold text-white btn-liquid flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20"
                    >
                      {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          <span>Enviar Convite</span>
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientsManagement;