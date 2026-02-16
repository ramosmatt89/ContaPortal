import React, { useState } from 'react';
import { MOCK_CLIENTS } from '../constants';
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
  ShieldAlert
} from 'lucide-react';

const ClientsManagement: React.FC = () => {
  // Simulate current logged-in accountant ID
  const CURRENT_ACCOUNTANT_ID = 'a1';

  const [clients, setClients] = useState<Client[]>(
    MOCK_CLIENTS.filter(c => c.accountantId === CURRENT_ACCOUNTANT_ID)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewClient(prev => ({ ...prev, [name]: value }));
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call delay and Link Generation
    setTimeout(() => {
      const newId = `c${Date.now()}`;
      const createdClient: Client = {
        id: newId,
        companyName: newClient.companyName,
        nif: newClient.nif || 'N/A',
        email: newClient.email,
        contactPerson: newClient.contactPerson,
        avatarUrl: `https://picsum.photos/seed/${newId}/200`,
        status: 'INVITED', // Default status for new invites
        pendingDocs: 0,
        accountantId: CURRENT_ACCOUNTANT_ID
      };

      setClients([createdClient, ...clients]);
      setIsLoading(false);
      
      // Instead of closing, show the generated link
      setGeneratedLink(`https://contaportal.pt/invite/${newId}?ref=${CURRENT_ACCOUNTANT_ID}`);
    }, 1500);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setGeneratedLink(null);
    setNewClient({ companyName: '', nif: '', email: '', contactPerson: '' });
  };

  const toggleClientStatus = (clientId: string, currentStatus: string) => {
    setClients(clients.map(c => {
      if (c.id === clientId) {
        if (currentStatus === 'ACTIVE' || currentStatus === 'PENDING' || currentStatus === 'OVERDUE') return { ...c, status: 'INACTIVE' };
        if (currentStatus === 'INACTIVE') return { ...c, status: 'ACTIVE' };
      }
      return c;
    }));
  };

  const deleteClient = (clientId: string) => {
    if (window.confirm('Tem a certeza que deseja remover este cliente? Esta ação é irreversível.')) {
      setClients(clients.filter(c => c.id !== clientId));
    }
  };

  const copyLink = () => {
    if(generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copiado!');
    }
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
    <div className="space-y-8 animate-fade-in-up pb-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Carteira de Clientes</h2>
          <p className="text-neutral-medium text-lg max-w-xl leading-relaxed">
            Gerencie o acesso ao portal. Os clientes só podem entrar através do seu <span className="text-brand-blue font-bold">Link de Convite</span>.
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
                    <button 
                      title="Copiar Link de Convite"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://contaportal.pt/invite/${client.id}`);
                        alert('Link copiado!');
                      }}
                      className="p-2 rounded-xl bg-blue-50 text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                 )}

                 <button className="p-2 rounded-xl hover:bg-neutral-light text-neutral-medium transition-colors">
                   <MoreVertical size={18} />
                 </button>

                 <button 
                    title={client.status === 'INACTIVE' ? 'Ativar' : 'Desativar'}
                    onClick={() => toggleClientStatus(client.id, client.status)}
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
                    onClick={() => deleteClient(client.id)}
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
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-tr from-brand-blue to-brand-purple rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-brand-blue/30">
                {generatedLink ? <CheckCircle size={32} /> : <Mail size={32} />}
              </div>
              <h3 className="text-3xl font-extrabold text-neutral-dark tracking-tight">
                {generatedLink ? 'Convite Gerado!' : 'Novo Convite'}
              </h3>
              <p className="text-neutral-medium mt-2 max-w-xs mx-auto">
                {generatedLink 
                  ? 'Envie este link para o cliente configurar o acesso seguro.' 
                  : 'Preencha os dados para gerar um link de acesso exclusivo.'}
              </p>
            </div>

            {generatedLink ? (
              // Success State - Show Link
              <div className="space-y-6 animate-fade-in-up">
                 <div className="bg-neutral-bg p-4 rounded-2xl border border-neutral-light relative group">
                    <p className="text-xs font-bold text-neutral-medium uppercase mb-2">Link de Ativação</p>
                    <div className="font-mono text-brand-blue text-sm break-all pr-8">
                      {generatedLink}
                    </div>
                    <button 
                      onClick={copyLink}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm text-neutral-dark hover:text-brand-blue transition-colors"
                    >
                      <Copy size={18} />
                    </button>
                 </div>
                 
                 <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-3">
                   <div className="text-yellow-600 mt-0.5"><ShieldAlert size={18} /></div>
                   <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                     Este link é único e expira em 48 horas. O cliente definirá a password no primeiro acesso.
                   </p>
                 </div>

                 <button 
                    onClick={handleCloseModal}
                    className="w-full py-4 rounded-2xl font-bold text-white btn-liquid shadow-lg"
                  >
                    Concluir
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
                        <span>Gerar Convite</span>
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