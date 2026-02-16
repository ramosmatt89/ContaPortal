import React, { useState } from 'react';
import { Client } from '../types';
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
  User,
  MoreVertical,
  ShieldAlert,
  RefreshCw,
  MailCheck
} from 'lucide-react';

interface ClientsManagementProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const ClientsManagement: React.FC<ClientsManagementProps> = ({ 
  clients, 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [lastInvitedEmail, setLastInvitedEmail] = useState<string>('');
  
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

  const generateInviteLink = (email: string) => {
    const inviterName = "O Seu Contabilista"; 
    const inviterLogoParam = "&logo=demo";
    // Using current origin to make link work in dev/preview environment
    const baseUrl = window.location.origin;
    return `${baseUrl}?invitedBy=${encodeURIComponent(inviterName)}${inviterLogoParam}&email=${encodeURIComponent(email)}`;
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Server Delay + Email Sending
    setTimeout(() => {
      const newId = `c${Date.now()}`;
      const createdClient: Client = {
        id: newId,
        companyName: newClient.companyName,
        nif: newClient.nif || 'N/A',
        email: newClient.email,
        contactPerson: newClient.contactPerson,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(newClient.companyName)}&background=random`,
        status: 'INVITED', // Default status for new invites
        pendingDocs: 0,
        accountantId: 'current_user'
      };

      onAddClient(createdClient);
      
      // Store email for success message
      setLastInvitedEmail(newClient.email);
      
      // Generate the link for the backup manual copy
      const link = generateInviteLink(newClient.email);
      setGeneratedLink(link);
      
      setIsLoading(false);
      showToast(`✉️ Convite enviado com sucesso para ${newClient.email}`);
    }, 1500);
  };

  const handleResendInvite = (client: Client) => {
    const link = generateInviteLink(client.email);
    const subject = "Convite para o ContaPortal";
    const body = `Olá,\n\nAqui está o seu link de acesso para o portal de contabilidade:\n\n${link}\n\nObrigado.`;
    
    // Trigger the user's default email client
    window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    showToast(`✉️ Cliente de e-mail aberto para ${client.email}`);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGeneratedLink(null);
    setNewClient({ companyName: '', nif: '', email: '', contactPerson: '' });
  };

  const toggleClientStatus = (client: Client) => {
    let newStatus = client.status;
    if (client.status === 'ACTIVE' || client.status === 'PENDING' || client.status === 'OVERDUE') newStatus = 'INACTIVE';
    else if (client.status === 'INACTIVE') newStatus = 'ACTIVE';
    
    // Only update if status changed
    if (newStatus !== client.status) {
       onUpdateClient({ ...client, status: newStatus as any });
       showToast(newStatus === 'INACTIVE' ? 'Cliente desativado' : 'Cliente ativado');
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showToast('🔗 Link copiado para a área de transferência');
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVITED':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-brand-blue border border-blue-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><Mail size={12}/> Convite Pendente</span>;
      case 'INACTIVE':
        return <span className="px-3 py-1 rounded-full bg-neutral-200 text-neutral-600 border border-neutral-300 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><Ban size={12}/> Inativo</span>;
      case 'OVERDUE':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><ShieldAlert size={12}/> Atrasado</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 shadow-sm"><CheckCircle size={12}/> Ativo</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-8 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] bg-neutral-dark text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <CheckCircle size={18} className="text-status-success" />
          <span className="font-bold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Carteira de Clientes</h2>
          <p className="text-neutral-medium text-lg max-w-xl leading-relaxed">
            Gerencie o acesso ao portal. Os clientes recebem um <span className="text-brand-blue font-bold">Convite por Email</span> automaticamente.
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

      {/* Modern Card Grid (Mobile First) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client.id} className="glass-panel p-6 rounded-[2rem] relative group hover:-translate-y-1 transition-transform duration-300">
             
             {/* Status Badge */}
             <div className="absolute top-6 right-6">
               {getStatusBadge(client.status)}
             </div>

             {/* Header */}
             <div className="flex items-center gap-4 mb-6">
               <div className="relative">
                 <img src={client.avatarUrl} alt={client.companyName} className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-white" />
                 <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                   <div className={`w-3 h-3 rounded-full ${client.status === 'ACTIVE' ? 'bg-status-success' : client.status === 'INVITED' ? 'bg-brand-blue' : 'bg-neutral-medium'}`}></div>
                 </div>
               </div>
               <div>
                 <h3 className="font-bold text-lg text-neutral-dark leading-tight">{client.companyName}</h3>
                 <p className="text-sm text-neutral-medium font-mono tracking-wide opacity-80">{client.nif}</p>
               </div>
             </div>

             {/* Info Grid */}
             <div className="bg-white/40 rounded-2xl p-4 mb-6 space-y-3">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white text-neutral-medium flex items-center justify-center shadow-sm">
                   <User size={14} />
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

             {/* Footer Actions */}
             <div className="flex items-center justify-between pt-2 border-t border-white/50">
               <span className="text-xs font-bold text-neutral-medium">
                 {client.status === 'INVITED' ? 'Aguardando registo' : 'Acesso permitido'}
               </span>
               
               <div className="flex items-center gap-2">
                 {client.status === 'INVITED' && (
                    <>
                      <button 
                        title="Enviar E-mail com Convite"
                        onClick={() => handleResendInvite(client)}
                        className="p-2 rounded-xl bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                      >
                        <Send size={18} />
                      </button>
                      <button 
                        title="Copiar Link Manualmente"
                        onClick={() => copyLink(generateInviteLink(client.email))}
                        className="p-2 rounded-xl hover:bg-neutral-light text-neutral-medium hover:text-neutral-dark transition-colors"
                      >
                        <Copy size={18} />
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
        ))}

        {/* Empty State */}
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

      {/* Add Client / Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-md transition-opacity" onClick={handleCloseModal}></div>
          
          <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white animate-fade-in-up overflow-hidden">
            
            {/* Modal Header */}
            <div className="mb-6 text-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg transition-colors duration-500 ${
                  generatedLink 
                    ? 'bg-gradient-to-tr from-green-400 to-status-success shadow-status-success/30' 
                    : 'bg-gradient-to-tr from-brand-blue to-brand-purple shadow-brand-blue/30'
                }`}>
                {generatedLink ? <MailCheck size={32} /> : <Mail size={32} />}
              </div>
              <h3 className="text-3xl font-extrabold text-neutral-dark tracking-tight">
                {generatedLink ? 'Convite Enviado!' : 'Novo Convite'}
              </h3>
              <p className="text-neutral-medium mt-2 max-w-xs mx-auto leading-relaxed">
                {generatedLink 
                  ? `Um e-mail automático foi enviado para ${lastInvitedEmail}.` 
                  : 'Preencha os dados abaixo. Um convite será enviado automaticamente por e-mail.'}
              </p>
            </div>

            {generatedLink ? (
              // Success State - Email Sent + Backup Link
              <div className="space-y-6 animate-fade-in-up">
                 
                 <div className="bg-neutral-bg p-4 rounded-2xl border border-neutral-light relative">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-xs font-bold text-neutral-medium uppercase">Link de Cópia Manual</p>
                       <span className="text-[10px] font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-lg">Backup</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 font-mono text-neutral-dark text-xs truncate bg-white p-3 rounded-xl border border-neutral-light">
                        {generatedLink}
                      </div>
                      <button 
                        onClick={() => copyLink(generatedLink!)}
                        className="p-3 bg-brand-blue text-white rounded-xl shadow-lg shadow-brand-blue/20 hover:bg-brand-purple transition-all active:scale-95"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <p className="text-[10px] text-neutral-medium mt-2">
                      Utilize este link caso o cliente não receba o e-mail automático.
                    </p>
                 </div>
                 
                 <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex gap-3">
                   <div className="text-status-success mt-0.5"><CheckCircle size={18} /></div>
                   <p className="text-xs text-green-800 font-medium leading-relaxed">
                     Cliente adicionado com sucesso à lista de espera. O status mudará quando o convite for aceite.
                   </p>
                 </div>

                 <button 
                    onClick={handleCloseModal}
                    className="w-full py-4 rounded-2xl font-bold text-white btn-liquid shadow-lg"
                  >
                    Concluir e Fechar
                  </button>
              </div>
            ) : (
              // Form State
              <form onSubmit={handleInvite} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">Nome da Empresa</label>
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
                  <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">Pessoa de Contacto</label>
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
                      pattern="[0-9]{9}"
                      title="NIF deve ter 9 dígitos"
                      value={newClient.nif}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl bg-white border border-neutral-light focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 text-neutral-dark font-medium transition-all"
                      placeholder="999999999"
                    />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-neutral-dark mb-1.5 ml-1">Email</label>
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
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientsManagement;