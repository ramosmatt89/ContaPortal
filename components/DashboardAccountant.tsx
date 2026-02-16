import React from 'react';
import { Client, User, Document } from '../types';
import { Users, FileCheck, AlertCircle, TrendingUp, MoreHorizontal, Check, Search, Filter, Plus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardAccountantProps {
  onNavigate: (view: string) => void;
  clients: Client[];
  user: User;
  documents: Document[];
}

const DashboardAccountant: React.FC<DashboardAccountantProps> = ({ onNavigate, clients, user, documents = [] }) => {
  
  // Calculate stats from real documents
  const totalDocs = documents.length;
  const pendingDocsCount = documents.filter(d => d.status === 'PENDENTE').length;
  
  // Simple mock chart data generation based on total count
  const data = [
    { name: 'Jan', docs: Math.floor(totalDocs * 0.1), validated: Math.floor(totalDocs * 0.08) },
    { name: 'Fev', docs: Math.floor(totalDocs * 0.2), validated: Math.floor(totalDocs * 0.15) },
    { name: 'Mar', docs: Math.floor(totalDocs * 0.15), validated: Math.floor(totalDocs * 0.1) },
    { name: 'Abr', docs: Math.floor(totalDocs * 0.3), validated: Math.floor(totalDocs * 0.25) },
    { name: 'Mai', docs: Math.floor(totalDocs * 0.2), validated: Math.floor(totalDocs * 0.18) },
    { name: 'Jun', docs: totalDocs, validated: totalDocs - pendingDocsCount },
  ];

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
    <div className="space-y-8 animate-fade-in-up pb-8">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Users, label: 'Total Clientes', value: clients.length, trend: 'Ativos', color: 'brand-blue', badgeColor: 'bg-blue-100 text-brand-blue border-blue-200' },
          { icon: FileCheck, label: 'Docs Pendentes', value: pendingDocsCount, trend: 'Ação Necessária', color: 'status-warning', badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
          { icon: AlertCircle, label: 'Alertas Fiscais', value: clients.filter(c => c.status === 'OVERDUE').length, trend: 'Urgente', color: 'status-error', badgeColor: 'bg-red-100 text-status-error border-red-200' }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-[2rem] flex flex-col justify-between h-40 relative overflow-hidden group hover:border-white transition-colors">
            <div className={`absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity text-${kpi.color}`}>
              <kpi.icon size={80} strokeWidth={1} />
            </div>
            
            <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm text-${kpi.color} flex items-center justify-center mb-4`}>
              <kpi.icon size={24} />
            </div>
            
            <div>
              <p className="text-neutral-medium font-medium text-sm mb-1">{kpi.label}</p>
              <div className="flex items-end gap-3">
                <h2 className="text-4xl font-bold text-neutral-dark tracking-tight">{kpi.value}</h2>
                <span className={`text-xs font-bold mb-2 px-2 py-0.5 rounded-lg border ${kpi.badgeColor}`}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout: Chart + Clients */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 glass-panel-dark p-8 rounded-[2rem] min-h-[420px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-xl text-neutral-dark">Fluxo de Documentos</h3>
              <p className="text-sm text-neutral-medium">Análise semestral de volume</p>
            </div>
            <button className="p-2 rounded-xl bg-neutral-light text-neutral-medium hover:bg-white hover:text-brand-blue transition-colors">
              <Filter size={18} />
            </button>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#007BFF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6C757D', fontSize: 12, fontWeight: 500}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6C757D', fontSize: 12, fontWeight: 500}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '16px', 
                    border: '1px solid rgba(255,255,255,0.8)', 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{color: '#343A40', fontWeight: 600}}
                  cursor={{stroke: '#007BFF', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="docs" 
                  stroke="#007BFF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDocs)" 
                />
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
                    <p className="text-sm font-bold text-neutral-dark">{client.companyName}</p>
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
        <div className="p-8 border-b border-neutral-light/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-neutral-dark">Progresso Mensal</h3>
            <p className="text-sm text-neutral-medium">Junho 2024</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-neutral-light rounded-xl text-xs font-bold text-neutral-medium hover:bg-white transition-colors">Exportar</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-light/30 text-neutral-medium uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-6 py-5">Docs Recebidos</th>
                <th className="px-6 py-5">IVA</th>
                <th className="px-6 py-5">SS</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-light/50">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-5 font-bold text-neutral-dark">{client.companyName}</td>
                  <td className="px-6 py-5">
                    <div className="w-32 bg-neutral-light rounded-full h-2 overflow-hidden shadow-inner">
                      <div 
                        className={`h-2 rounded-full transition-all duration-1000 ${client.status === 'OVERDUE' ? 'bg-status-warning w-[40%]' : 'bg-status-success w-full'}`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-neutral-medium font-medium mt-1 block">
                      {client.status === 'OVERDUE' ? '40% Completo' : '100% Completo'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {client.status === 'OVERDUE' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100">
                         Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-status-success text-xs font-bold border border-green-100">
                         Validado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-status-success text-xs font-bold border border-green-100">
                         Submetido
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