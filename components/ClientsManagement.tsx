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
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [previewClient, setPreviewClient] = useState<any>(null); // For previewing the email content
  
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
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };

  const generateSecureInvite = () => {
    const token = crypto.randomUUID();
    const expires = new Date();
    // 7 Days Expiration
    expires.setDate(expires.getDate() + 7);
    return { token, expires: expires.toISOString() };
  };

  const getLinkFromToken = (token: string) => {
    const url = new URL(window.location.href);
    url.search = ''; 
    url.searchParams.set('token', token);
    return url.toString();
  };

  const handleInvite = (e: React.FormEvent) => {
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

    const { token, expires } = generateSecureInvite();

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
      setGeneratedLink(link);
      setPreviewClient(createdClient);
      
      setIsLoading(false);
      showToast(`Convite gerado com sucesso.`);
    }, 1500);
  };

  const handleResendInvite = (client: Client) => {
    // Regenerate token if expired or missing, otherwise use existing
    let token = client.inviteToken;
    let expires = client.inviteExpires;
    
    const isExpired = expires && new Date(expires) < new Date();

    if (!token || isExpired) {
        const gen = generateSecureInvite();
        token = gen.token;
        expires = gen.expires;
        onUpdateClient({
            ...client,
            status: 'PENDING',
            inviteToken: token,
            inviteExpires: expires
        });
        showToast("Novo token de 7 dias gerado.");
    }

    const link = getLinkFromToken(token!);
    setGeneratedLink(link);
    setPreviewClient(client);
    setIsModalOpen(true); // Open the preview modal again
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGeneratedLink(null);
    setPreviewClient(null);
    setNewClient({ companyName: '', nif: '', email: '', contactPerson: '' });
  };

  // --- NEW FUNCTION: Open Default Email App ---
  const handleOpenEmailApp = () => {
    if (!generatedLink || !previewClient) return;

    const subject = `Convite: Acesso ao Portal - ${currentUser.name}`;
    // Mailto body must be plain text
    const body = `Olá ${previewClient.contactPerson},\n\n` +
                 `Foi convidado por ${currentUser.name} para aceder ao seu portal de documentos contabilísticos.\n\n` +
                 `Clique no link abaixo para aceitar o convite e definir a sua palavra-passe:\n` +
                 `${generatedLink}\n\n` +
                 `Este link é válido por 7 dias.\n\n` +
                 `Cumprimentos,\n${currentUser.name}`;

    window.location.href = `mailto:${previewClient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast('App de e-mail aberta.');
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
    // Check Expiration
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
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><CheckCircle size={12}/> Convite Aceite</span>;
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
                   <span className={`text-xs font-bold ${isExpired ? 'text-status-error' : 'text-neutral-medium'}`}>
                     {client.status === 'ACTIVE' ? 'Acesso Ativo' : isExpired ? 'Token Expirado' : 'Aguardando Registo'}
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
                          
                          {!isExpired && (
                            <button 
                                title="Copiar Link"
                                onClick={() => copyLink(getLinkFromToken(client.inviteToken || ''))}
                                className="p-2 rounded-xl hover:bg-neutral-light text-neutral-medium hover:text-neutral-dark transition-colors"
                            >
                                <Copy size={18} />
                            </button>
                          )}
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
          
          <div className={`relative w-full ${generatedLink ? 'max-w-2xl' : 'max-w-lg'} bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-fade-in-up overflow-hidden transition-all max-h-[90vh] overflow-y-auto`}>
            
            {generatedLink ? (
              // --- NEWSLETTER EMAIL PREVIEW TEMPLATE ---
              <div className="animate-fade-in-up">
                 <div className="flex justify-between items-center mb-6">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-status-success flex items-center justify-center">
                         <CheckCircle size={16} />
                      </div>
                      <h3 className="text-lg font-bold text-neutral-dark">Convite Gerado</h3>
                   </div>
                   <button onClick={handleCloseModal} className="text-neutral-medium hover:text-neutral-dark p-2 hover:bg-neutral-light rounded-full transition-colors">
                     <Ban size={20} />
                   </button>
                 </div>
                 
                 <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl mb-6 text-sm text-neutral-dark">
                    <p className="flex gap-2">
                       <span className="font-bold text-brand-blue">Nota:</span> 
                       Como este é um sistema de demonstração (Frontend), o e-mail não é enviado automaticamente pelo servidor.
                    </p>
                    <p className="mt-2 ml-10 text-neutral-medium">
                       Utilize o botão <strong>"Enviar E-mail"</strong> abaixo para abrir a sua aplicação de e-mail (Outlook, Gmail, etc.) com o texto preenchido.
                    </p>
                 </div>

                 {/* EMAIL CONTAINER (Newsletter Style) */}
                 <div className="bg-[#F2F4F7] rounded-xl p-4 md:p-8 border border-neutral-light overflow-hidden relative shadow-inner">
                    <div className="absolute top-2 right-4 text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                       <Smartphone size={10} /> Pré-visualização
                    </div>
                    
                    {/* EMAIL CARD */}
                    <div className="max-w-[400px] mx-auto bg-white rounded-t-2xl rounded-b-2xl shadow-sm border-t-4 border-t-brand-blue overflow-hidden">
                       
                       {/* Header: Identity */}
                       <div className="p-8 pb-4 text-center">
                          {currentUser.avatarUrl ? (
                             <img src={currentUser.avatarUrl} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md" alt="Logo" />
                          ) : (
                             <div className="w-16 h-16 rounded-full bg-brand-blue text-white mx-auto mb-4 flex items-center justify-center text-xl font-bold">
                                {currentUser.name.charAt(0)}
                             </div>
                          )}
                          <h2 className="text-neutral-dark font-bold text-xl">{currentUser.name}</h2>
                          <p className="text-xs text-neutral-medium uppercase tracking-wide mt-1 font-semibold">Gabinete de Contabilidade</p>
                       </div>

                       {/* Divider */}
                       <div className="w-full h-px bg-neutral-light my-2"></div>

                       {/* Body: Message */}
                       <div className="p-8 pt-6 text-center">
                          <h1 className="text-xl font-bold text-neutral-dark mb-4">Bem-vindo(a) ao seu Portal</h1>
                          <p className="text-neutral-600 text-[15px] leading-relaxed mb-8">
                             Olá <strong>{previewClient?.contactPerson.split(' ')[0]}</strong>,<br/><br/>
                             Foi convidado para aceder ao seu portal de documentos contabilísticos. Aqui poderá consultar faturas, enviar despesas e validar impostos de forma segura.
                          </p>

                          {/* Primary Button */}
                          <button 
                             className="block w-full py-4 bg-[#007BFF] text-white rounded-lg font-bold text-base shadow-lg hover:bg-blue-600 transition-colors mb-6"
                             onClick={() => copyLink(generatedLink)}
                          >
                             Aceitar Convite
                          </button>

                          {/* Expiration Badge */}
                          <div className="inline-flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-md border border-yellow-100 mb-8">
                             <Clock size={12} className="text-yellow-600" />
                             <span className="text-[11px] text-yellow-800 font-medium">Este link expira em 7 dias</span>
                          </div>

                          {/* Fallback Link */}
                          <div className="text-left border-t border-neutral-light pt-6">
                             <p className="text-[11px] text-neutral-400 mb-2">Se o botão não funcionar, copie este link:</p>
                             <div className="bg-neutral-50 border border-neutral-200 rounded p-2 flex items-center gap-2 overflow-hidden">
                                <code className="text-[10px] text-neutral-500 truncate flex-1 block font-mono">
                                   {generatedLink}
                                </code>
                                <button onClick={() => copyLink(generatedLink)} className="text-brand-blue hover:text-brand-purple shrink-0">
                                   <Copy size={12} />
                                </button>
                             </div>
                          </div>
                       </div>

                       {/* Footer: Trust */}
                       <div className="bg-[#F8F9FA] p-4 text-center border-t border-neutral-light">
                          <div className="flex flex-col items-center gap-2 text-neutral-400 text-[10px]">
                             <ShieldCheck size={14} />
                             <span>Convite seguro enviado via ContaPortal</span>
                             <span>&copy; {new Date().getFullYear()} {currentUser.name}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <button 
                       onClick={handleOpenEmailApp} 
                       className="w-full md:w-auto px-6 py-3 rounded-2xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-600 shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <Send size={18}/> Enviar E-mail (App Padrão)
                    </button>
                    
                    <button onClick={() => copyLink(generatedLink)} className="text-brand-blue text-sm font-bold flex items-center gap-2 hover:underline">
                        <ExternalLink size={14}/> Copiar Link Manualmente
                    </button>
                 </div>
              </div>
            ) : (
              // --- FORM ---
              <>
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
                          <span>Gerar Convite</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientsManagement;