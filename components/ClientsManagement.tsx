import React, { useState } from 'react';
import { MOCK_CLIENTS } from '../constants';
import { Client } from '../types';
import { 
  Search, 
  Plus, 
  Mail, 
  MoreHorizontal, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Loader2, 
  Send 
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

    // Simulate API call delay
    setTimeout(() => {
      const createdClient: Client = {
        id: `c${Date.now()}`,
        companyName: newClient.companyName,
        nif: newClient.nif,
        email: newClient.email,
        contactPerson: newClient.contactPerson,
        avatarUrl: `https://picsum.photos/seed/${newClient.nif}/200`,
        status: 'INVITED', // Default status for new invites
        pendingDocs: 0,
        accountantId: CURRENT_ACCOUNTANT_ID
      };

      setClients([createdClient, ...clients]);
      setIsLoading(false);
      setIsModalOpen(false);
      setNewClient({ companyName: '', nif: '', email: '', contactPerson: '' });
      // In a real app, we would trigger a toast notification here
      alert(`Convite enviado com sucesso para ${createdClient.email}`);
    }, 1500);
  };

  const toggleClientStatus = (clientId: string, currentStatus: string) => {
    setClients(clients.map(c => {
      if (c.id === clientId) {
        // If Invited -> Can't toggle yet (waiting acceptance)
        // If Active -> Inactive
        // If Inactive -> Active
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'INVITED':
        return <span className="px-3 py-1 rounded-lg bg-blue-50 text-brand-blue border border-blue-100 text-xs font-bold flex items-center gap-1"><Mail size={12}/> Convite Enviado</span>;
      case 'INACTIVE':
        return <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-medium border border-neutral-200 text-xs font-bold flex items-center gap-1"><Ban size={12}/> Inativo</span>;
      case 'OVERDUE':
        return <span className="px-3 py-1 rounded-lg bg-red-50 text-status-error border border-red-100 text-xs font-bold flex items-center gap-1">Atrasado</span>;
      default:
        return <span className="px-3 py-1 rounded-lg bg-green-50 text-status-success border border-green-100 text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Ativo</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-neutral-dark tracking-tight">Gestão de Clientes</h2>
          <p className="text-neutral-medium font-medium">Gerencie o acesso e convites da sua carteira.</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium group-focus-within:text-brand-blue transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Nome, NIF ou Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-12 pr-4 py-3 bg-white/60 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 backdrop-blur-md shadow-sm transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-liquid px-6 py-3 rounded-xl text-white font-bold shadow-lg flex items-center gap-2 whitespace-nowrap active:scale-95 transition-transform"
          >
            <Plus size={20} />
            <span className="hidden md:inline">Adicionar Cliente</span>
            <span className="md:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="glass-panel-dark overflow-hidden rounded-[2rem] border border-white/50 min-h-[500px]">
        {filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-light/30 text-neutral-medium uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-5">Empresa / NIF</th>
                  <th className="px-6 py-5">Contacto</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light/50">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={client.avatarUrl} alt={client.companyName} className="w-10 h-10 rounded-xl object-cover shadow-sm grayscale group-hover:grayscale-0 transition-all" />
                        <div>
                          <p className="font-bold text-neutral-dark">{client.companyName}</p>
                          <p className="text-[11px] text-neutral-medium font-mono">{client.nif}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-neutral-dark">{client.contactPerson}</p>
                      <p className="text-xs text-neutral-medium">{client.email}</p>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(client.status)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        {/* Action Buttons */}
                        {client.status === 'INVITED' ? (
                           <button 
                             title="Reenviar Convite"
                             onClick={() => alert(`Convite reenviado para ${client.email}`)}
                             className="p-2 rounded-lg hover:bg-blue-100 hover:text-brand-blue text-neutral-medium transition-colors"
                           >
                             <Send size={18} />
                           </button>
                        ) : (
                          <button 
                            title={client.status === 'INACTIVE' ? 'Ativar' : 'Desativar'}
                            onClick={() => toggleClientStatus(client.id, client.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              client.status === 'INACTIVE' 
                                ? 'hover:bg-green-100 hover:text-status-success text-neutral-medium' 
                                : 'hover:bg-orange-100 hover:text-orange-600 text-neutral-medium'
                            }`}
                          >
                            {client.status === 'INACTIVE' ? <CheckCircle size={18} /> : <Ban size={18} />}
                          </button>
                        )}
                        
                        <button 
                          title="Remover"
                          onClick={() => deleteClient(client.id)}
                          className="p-2 rounded-lg hover:bg-red-100 hover:text-status-error text-neutral-medium transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8">
            <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mb-4 text-neutral-medium">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-neutral-dark">Nenhum cliente encontrado</h3>
            <p className="text-neutral-medium">Tente ajustar a pesquisa ou adicione um novo cliente.</p>
          </div>
        )}
      </div>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-dark/20 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-8 border border-white animate-fade-in-up">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-neutral-dark">Convidar Cliente</h3>
              <p className="text-sm text-neutral-medium mt-1">
                Envie um link seguro para o cliente configurar o acesso ao portal.
              </p>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1 ml-1">Nome da Empresa</label>
                <input 
                  type="text" 
                  name="companyName"
                  required
                  value={newClient.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-bg border-none focus:ring-2 focus:ring-brand-blue/30 text-neutral-dark font-medium"
                  placeholder="Ex: Tech Solutions Lda"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1 ml-1">Pessoa de Contacto</label>
                <input 
                  type="text" 
                  name="contactPerson"
                  required
                  value={newClient.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-bg border-none focus:ring-2 focus:ring-brand-blue/30 text-neutral-dark font-medium"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1 ml-1">NIF</label>
                  <input 
                    type="text" 
                    name="nif"
                    required
                    pattern="[0-9]{9}"
                    title="NIF deve ter 9 dígitos"
                    value={newClient.nif}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-bg border-none focus:ring-2 focus:ring-brand-blue/30 text-neutral-dark font-medium"
                    placeholder="123456789"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-neutral-dark mb-1 ml-1">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={newClient.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-bg border-none focus:ring-2 focus:ring-brand-blue/30 text-neutral-dark font-medium"
                    placeholder="cliente@mail.com"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-neutral-medium hover:bg-neutral-light transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white btn-liquid flex items-center justify-center gap-2"
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