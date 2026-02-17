import React, { useState } from 'react';
import { Client, User, Document, DocStatus, TaxObligation } from '../types';
import { Users, FileCheck, AlertCircle, TrendingUp, MoreHorizontal, Check, Search, Filter, Plus, X, Eye, FileText, DownloadCloud, Calendar, DollarSign, Send } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardAccountantProps {
  onNavigate: (view: string) => void;
  clients: Client[];
  user: User;
  documents: Document[];
  viewMode?: 'overview' | 'documents' | 'obligations';
  onValidate?: (docId: string, status: DocStatus) => void;
  onAddObligation?: (obligation: Omit<TaxObligation, 'id'>) => void;
  obligations?: TaxObligation[];
}

const DashboardAccountant: React.FC<DashboardAccountantProps> = ({ 
  onNavigate, 
  clients, 
  user, 
  documents = [], 
  viewMode = 'overview',
  onValidate,
  onAddObligation,
  obligations = []
}) => {
  
  const totalDocs = documents.length;
  const pendingDocs = documents.filter(d => d.status === DocStatus.PENDING);
  const pendingDocsCount = pendingDocs.length;
  
  const [docFilter, setDocFilter] = useState('');
  
  // Obligations State
  const [isObligationModalOpen, setIsObligationModalOpen] = useState(false);
  const [newObligation, setNewObligation] = useState({
    clientId: '',
    name: 'IVA - Declaração Periódica',
    amount: '',
    deadline: ''
  });

  // Export CSV Logic
  const handleExportReport = () => {
    const headers = ['Cliente', 'NIF', 'Email', 'Docs Pendentes', 'Estado'];
    const rows = clients.map(c => [
      c.companyName, 
      c.nif, 
      c.email, 
      c.pendingDocs, 
      c.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\r\n";
    rows.forEach(row => {
      csvContent += row.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_clientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddObligation && newObligation.clientId && newObligation.amount && newObligation.deadline) {
      // Find the user ID corresponding to the selected client from the clients list
      // In the App.tsx logic, the Client ID in the accountant list usually maps to the user or we use the User ID if available.
      // Here we use the selected client's ID.
      const selectedClient = clients.find(c => c.id === newObligation.clientId);
      // NOTE: In a real app we need to map ClientID -> UserID reliably. 
      // For this prototype, we'll assume the UserID matches or we use the ClientID provided.
      // However, App.tsx filters obligations by matching user.id or email. 
      // Let's pass the USER ID (which is the client.id in our simplified creation flow)
      
      onAddObligation({
        clientId: newObligation.clientId, // This ID must match the User ID of the client
        name: newObligation.name,
        amount: parseFloat(newObligation.amount),
        deadline: newObligation.deadline,
        status: 'PENDING'
      });
      setIsObligationModalOpen(false);
      setNewObligation({ clientId: '', name: 'IVA', amount: '', deadline: '' });
      alert('Obrigação enviada ao cliente com sucesso!');
    }
  };

  const getClientName = (id: string) => {
     const c = clients.find(cl => cl.id === id || cl.email === id);
     return c ? c.companyName : 'Cliente Desconhecido';
  };

  // --- OBLIGATIONS VIEW ---
  if (viewMode === 'obligations') {
    return (
      <div className="space-y-6 animate-fade-in-up pb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Obrigações Fiscais</h2>
            <p className="text-neutral-medium text-base md:text-lg">Envie guias de pagamento e controle os prazos.</p>
          </div>
          <button 
            onClick={() => setIsObligationModalOpen(true)}
            className="w-full md:w-auto btn-liquid px-6 py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={20} /> Nova Obrigação
          </button>
        </div>

        <div className="glass-panel-dark rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-neutral-light/50 text-neutral-medium uppercase text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Obrigação</th>
                  <th className="px-6 py-4">Prazo</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light/50">
                {obligations.map(obl => (
                  <tr key={obl.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-neutral-dark">{getClientName(obl.clientId)}</td>
                    <td className="px-6 py-4">{obl.name}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Calendar size={14} className="text-neutral-medium"/>
                      {new Date(obl.deadline).toLocaleDateString('pt-PT')}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{obl.amount.toFixed(2)}€</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${
                        obl.status === 'PAID' ? 'bg-green-50 text-status-success border-green-100' :
                        obl.status === 'OVERDUE' ? 'bg-red-50 text-status-error border-red-100' :
                        'bg-blue-50 text-brand-blue border-blue-100'
                      }`}>
                        {obl.status === 'PAID' ? 'Pago' : obl.status === 'OVERDUE' ? 'Atrasado' : 'Enviado'}
                      </span>
                    </td>
                  </tr>
                ))}
                {obligations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-medium">
                      Nenhuma obrigação registada. Clique em "Nova Obrigação" para começar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isObligationModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-neutral-dark/40 backdrop-blur-sm" onClick={() => setIsObligationModalOpen(false)}></div>
            <div className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-fade-in-up">
              <h3 className="text-2xl font-bold text-neutral-dark mb-6">Enviar Guia de Pagamento</h3>
              <form onSubmit={submitObligation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Cliente</label>
                  <select 
                    required
                    className="w-full p-3 rounded-xl bg-neutral-bg border border-neutral-light focus:border-brand-blue outline-none"
                    value={newObligation.clientId}
                    onChange={e => setNewObligation({...newObligation, clientId: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.filter(c => c.status === 'ACTIVE').map(c => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-neutral-dark mb-1">Tipo de Obrigação</label>
                   <input 
                      type="text"
                      list="tax-types"
                      required
                      className="w-full p-3 rounded-xl bg-neutral-bg border border-neutral-light focus:border-brand-blue outline-none"
                      value={newObligation.name}
                      onChange={e => setNewObligation({...newObligation, name: e.target.value})}
                   />
                   <datalist id="tax-types">
                     <option value="IVA - Declaração Periódica" />
                     <option value="TSU - Segurança Social" />
                     <option value="IRC - Pagamento por Conta" />
                     <option value="Retenção na Fonte" />
                   </datalist>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1">Valor (€)</label>
                    <input 
                      type="number" step="0.01"
                      required
                      className="w-full p-3 rounded-xl bg-neutral-bg border border-neutral-light focus:border-brand-blue outline-none"
                      value={newObligation.amount}
                      onChange={e => setNewObligation({...newObligation, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1">Data Limite</label>
                    <input 
                      type="date"
                      required
                      className="w-full p-3 rounded-xl bg-neutral-bg border border-neutral-light focus:border-brand-blue outline-none"
                      value={newObligation.deadline}
                      onChange={e => setNewObligation({...newObligation, deadline: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 mt-4 rounded-xl btn-liquid text-white font-bold shadow-lg">
                  Enviar para Cliente
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- DOCUMENTS VALIDATION VIEW ---
  if (viewMode === 'documents') {
    const displayedDocs = pendingDocs.filter(d => d.title.toLowerCase().includes(docFilter.toLowerCase()));

    return (
       <div className="space-y-6 animate-fade-in-up pb-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
           <div>
             <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-dark tracking-tight mb-2">Validação</h2>
             <p className="text-neutral-medium text-base md:text-lg">
               Você tem <span className="font-bold text-brand-blue">{pendingDocsCount} documentos</span> aguardando aprovação.
             </p>
           </div>
           
           <div className="relative group w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium group-focus-within:text-brand-blue transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Filtrar por nome..."
                value={docFilter}
                onChange={(e) => setDocFilter(e.target.value)}
                className="w-full md:w-72 pl-12 pr-4 py-3.5 bg-white border border-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/20 shadow-sm transition-all"
              />
           </div>
         </div>

         {displayedDocs.length === 0 ? (
           <div className="glass-panel p-12 rounded-[2.5rem] text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-green-50 text-status-success rounded-full flex items-center justify-center mb-4">
                <Check size={40} />
              </div>
              <h3 className="text-xl font-bold text-neutral-dark">Tudo limpo!</h3>
              <p className="text-neutral-medium">Não existem documentos pendentes com os filtros atuais.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {displayedDocs.map(doc => (
               <div key={doc.id} className="glass-panel p-6 rounded-[2rem] flex flex-col relative group hover:-translate-y-1 transition-transform">
                  
                  {/* Doc Header */}
                  <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center">
                           <FileText size={24} />
                        </div>
                        <div className="overflow-hidden">
                           <h4 className="font-bold text-neutral-dark truncate pr-2" title={doc.title}>{doc.title}</h4>
                           <p className="text-xs text-neutral-medium flex items-center gap-1">
                             {new Date(doc.date).toLocaleDateString()} • {doc.type}
                           </p>
                        </div>
                     </div>
                     <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-lg border border-yellow-200 uppercase">
                        Pendente
                     </span>
                  </div>

                  {/* Preview Placeholder */}
                  <div className="h-32 bg-neutral-light/50 rounded-xl mb-4 border-2 border-dashed border-neutral-light flex items-center justify-center relative overflow-hidden group-hover:border-brand-blue/30 transition-colors">
                     {doc.fileUrl ? (
                        <div className="w-full h-full relative">
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                              <Eye size={24} className="text-neutral-medium mb-1" />
                              <span className="text-xs font-bold text-neutral-medium">Pré-visualização</span>
                          </div>
                          <div className="absolute inset-0 bg-neutral-100 pattern-paper opacity-50"></div> 
                        </div>
                     ) : (
                        <span className="text-xs text-neutral-medium">Sem pré-visualização</span>
                     )}
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-auto pt-4 border-t border-white/50 flex gap-2">
                     <button 
                        onClick={() => onValidate?.(doc.id, DocStatus.REJECTED)}
                        className="flex-1 py-3 rounded-xl border border-red-100 bg-red-50 text-status-error font-bold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                     >
                        <X size={16} /> Rejeitar
                     </button>
                     <button 
                        onClick={() => onValidate?.(doc.id, DocStatus.APPROVED)}
                        className="flex-1 py-3 rounded-xl bg-status-success text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                     >
                        <Check size={16} /> Aprovar
                     </button>
                  </div>
               </div>
             ))}
           </div>
         )}
       </div>
    );
  }

  // --- OVERVIEW VIEW (DEFAULT) ---
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in-up">
        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-brand-blue/10 mb-8 border border-white/60">
          <Users size={40} className="text-brand-blue" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-dark mb-4">Olá, {user.name.split(' ')[0]}!</h2>
        <p className="text-neutral-medium max-w-md mb-8 text-lg leading-relaxed">
          O seu escritório digital está pronto. Comece por adicionar a sua primeira empresa para gerir documentos.
        </p>
        <button 
          onClick={() => onNavigate('clients')}
          className="btn-liquid px-8 py-4 rounded-2xl text-white font-bold text-lg flex items-center gap-3 shadow-lg hover:shadow-brand-blue/30 hover:-translate-y-1 transition-transform"
        >
          <Plus size={24} />
          <span>Adicionar Primeiro Cliente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-8">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
           onClick={() => onNavigate('clients')}
           className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between h-auto min-h-[140px] md:h-40 relative overflow-hidden group hover:border-brand-blue/50 cursor-pointer transition-colors"
        >
            <div className="absolute right-0 top-0 p-6 opacity-10 text-brand-blue">
              <Users size={80} strokeWidth={1} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm text-brand-blue flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-neutral-medium font-medium text-sm mb-1">Total Clientes</p>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-bold text-neutral-dark tracking-tight">{clients.length}</h2>
                <span className="text-xs font-bold mb-2 px-2 py-0.5 rounded-lg border bg-blue-100 text-brand-blue border-blue-200">
                  Ativos
                </span>
              </div>
            </div>
        </div>

        <div 
           onClick={() => onNavigate('documents')}
           className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between h-auto min-h-[140px] md:h-40 relative overflow-hidden group hover:border-yellow-400 cursor-pointer transition-colors"
        >
            <div className="absolute right-0 top-0 p-6 opacity-10 text-status-warning">
              <FileCheck size={80} strokeWidth={1} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm text-status-warning flex items-center justify-center mb-4">
              <FileCheck size={24} />
            </div>
            <div>
              <p className="text-neutral-medium font-medium text-sm mb-1">Docs Pendentes</p>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-bold text-neutral-dark tracking-tight">{pendingDocsCount}</h2>
                <span className="text-xs font-bold mb-2 px-2 py-0.5 rounded-lg border bg-yellow-100 text-yellow-800 border-yellow-200">
                  Ação Necessária
                </span>
              </div>
            </div>
        </div>

        <div className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between h-auto min-h-[140px] md:h-40 relative overflow-hidden group hover:border-status-error/50 transition-colors">
            <div className="absolute right-0 top-0 p-6 opacity-10 text-status-error">
              <AlertCircle size={80} strokeWidth={1} />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm text-status-error flex items-center justify-center mb-4">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-neutral-medium font-medium text-sm mb-1">Alertas Fiscais</p>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-bold text-neutral-dark tracking-tight">{clients.filter(c => c.status === 'OVERDUE').length}</h2>
                <span className="text-xs font-bold mb-2 px-2 py-0.5 rounded-lg border bg-red-100 text-status-error border-red-200">
                  Urgente
                </span>
              </div>
            </div>
        </div>
      </div>

      {/* Main Layout: Chart + Clients */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Chart Section - Mocked Data Visualization */}
        <div className="lg:col-span-2 glass-panel-dark p-6 md:p-8 rounded-[2rem] min-h-[350px] md:min-h-[420px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-xl text-neutral-dark">Fluxo de Documentos</h3>
              <p className="text-sm text-neutral-medium">Análise semestral de volume</p>
            </div>
            <button className="p-2 rounded-xl bg-neutral-light text-neutral-medium hover:bg-white hover:text-brand-blue transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                  { name: 'Jan', docs: 12, validated: 10 },
                  { name: 'Fev', docs: 18, validated: 15 },
                  { name: 'Mar', docs: 15, validated: 15 },
                  { name: 'Abr', docs: 22, validated: 20 },
                  { name: 'Mai', docs: 28, validated: 25 },
                  { name: 'Jun', docs: totalDocs || 5, validated: (totalDocs - pendingDocsCount) || 3 },
                ]}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007BFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6C757D', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6C757D', fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.8)', 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{color: '#343A40', fontWeight: 600}}
                />
                <Area type="monotone" dataKey="docs" stroke="#007BFF" strokeWidth={3} fillOpacity={1} fill="url(#colorDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client List (Mini) */}
        <div className="glass-panel p-6 rounded-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-neutral-dark">Estado Clientes</h3>
            <button 
              onClick={() => onNavigate('clients')}
              className="p-2 bg-white/50 rounded-xl hover:bg-white transition-colors text-brand-blue"
            >
              <Search size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {clients.slice(0, 4).map(client => (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 transition-colors cursor-pointer group border border-transparent hover:border-white/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={client.avatarUrl} alt={client.companyName} className="w-11 h-11 rounded-xl object-cover shadow-sm" />
                    {client.status === 'OVERDUE' && (
                       <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-status-error border-2 border-white rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-dark truncate max-w-[120px]">{client.companyName}</p>
                    <p className="text-[11px] text-neutral-medium font-medium tracking-wide">{client.nif}</p>
                  </div>
                </div>
                
                <div className="text-right">
                   {client.pendingDocs > 0 ? (
                     <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-xs">
                       {client.pendingDocs}
                     </div>
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-green-100 text-status-success flex items-center justify-center">
                       <Check size={16} strokeWidth={3} />
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate('clients')}
            className="w-full mt-6 btn-liquid text-white font-semibold py-3.5 rounded-xl text-sm flex items-center justify-center"
          >
            Gestão de Clientes
          </button>
        </div>

      </div>

      {/* Task Table */}
      <div className="glass-panel-dark overflow-hidden rounded-[2rem] border border-white/50">
        <div className="p-6 md:p-8 border-b border-neutral-light/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-neutral-dark">Progresso Mensal</h3>
            <p className="text-sm text-neutral-medium">{new Date().toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <button onClick={handleExportReport} className="w-full md:w-auto px-4 py-2 bg-neutral-light rounded-xl text-xs font-bold text-neutral-medium hover:bg-white hover:text-brand-blue transition-colors flex items-center justify-center gap-2">
                <DownloadCloud size={14}/> Exportar CSV
             </button>
          </div>
        </div>
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-neutral-light/30 text-neutral-medium uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 md:px-8 py-5">Cliente</th>
                <th className="px-6 py-5">Docs Recebidos</th>
                <th className="px-6 py-5">IVA</th>
                <th className="px-6 py-5">SS</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light/50">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 md:px-8 py-5 font-bold text-neutral-dark">{client.companyName}</td>
                  <td className="px-6 py-5">
                    <div className="w-32 bg-neutral-light rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${client.pendingDocs > 0 ? 'bg-status-warning w-[60%]' : 'bg-status-success w-full'}`}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-status-success text-xs font-bold border border-green-100">
                         Em Dia
                    </span>
                  </td>
                  <td className="px-6 py-5">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-status-success text-xs font-bold border border-green-100">
                         Em Dia
                      </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 rounded-lg text-neutral-medium hover:text-brand-blue hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAccountant;