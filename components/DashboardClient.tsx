import React, { useRef } from 'react';
import { User, Document, DocStatus } from '../types';
import { ArrowUpRight, FileText, CheckCircle, Clock, UploadCloud, ChevronRight, FilePlus } from 'lucide-react';

interface DashboardClientProps {
  user: User;
  documents: Document[];
  onUpload: (file: File) => void;
  accountantName: string;
}

const DashboardClient: React.FC<DashboardClientProps> = ({ user, documents, onUpload, accountantName }) => {
  const pendingDocs = documents.filter(d => d.status === DocStatus.PENDING).length;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      
      {/* Hero Section */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Welcome Card - Blue/Purple Gradient */}
        <div className="md:col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 shadow-2xl shadow-brand-blue/20 border border-white/30 group">
           {/* Vivid Liquid Gradient Background: Electric Blue #007BFF to Vibrant Purple #8A2BE2 */}
           <div className="absolute inset-0 bg-gradient-to-br from-brand-blue via-[#4a90e2] to-brand-purple transition-all duration-1000 group-hover:scale-105"></div>
           <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse-slow"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-blue opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>
           
           {/* Glass Overlay for depth */}
           <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>

           <div className="relative z-10 text-white h-full flex flex-col justify-between">
             <div>
               <div className="flex items-center gap-2 mb-3 opacity-90">
                 <span className="text-[10px] font-bold uppercase tracking-widest border border-white/30 px-2 py-1 rounded-lg backdrop-blur-md">Visão Geral</span>
                 <span className="text-xs font-semibold">{new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight">Olá, {user.name.split(' ')[0]}! 👋</h2>
               <p className="text-blue-50 text-lg max-w-md font-medium">
                 {pendingDocs > 0 ? (
                   <>Você enviou <strong className="text-white border-b-2 border-brand-purple">{pendingDocs} documentos</strong> que aguardam validação.</>
                 ) : (
                   <>Tudo em dia! Você não tem documentos pendentes.</>
                 )}
               </p>
               <p className="text-xs mt-2 opacity-80">Contabilista: {accountantName}</p>
             </div>
             
             <div className="mt-8 flex flex-wrap gap-4">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={handleFileChange} 
               />
               <button 
                 onClick={triggerUpload}
                 className="bg-white text-brand-blue hover:bg-blue-50 px-7 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
               >
                 <UploadCloud size={20} className="text-brand-purple" />
                 Enviar Documento
               </button>
             </div>
           </div>
        </div>

        {/* Status Card - Liquid Glass */}
        <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-status-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-status-success to-[#20c997] text-white flex items-center justify-center mb-5 shadow-xl shadow-status-success/30 mx-auto group-hover:scale-110 transition-transform duration-500">
              <CheckCircle size={48} />
            </div>
            <p className="text-xs font-bold text-neutral-medium uppercase tracking-widest mb-2">Situação Fiscal</p>
            <p className="text-3xl font-extrabold text-neutral-dark tracking-tight">Regular</p>
            <div className="mt-5 text-xs font-bold text-status-success bg-green-50 px-4 py-1.5 rounded-full inline-block border border-green-100">
              Atualizado Hoje
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity / Documents */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <div>
            <h3 className="font-bold text-2xl text-neutral-dark">Seus Documentos</h3>
            <p className="text-sm text-neutral-medium font-medium">Histórico de envios e aprovações</p>
          </div>
        </div>

        <div className="glass-panel-dark rounded-[2.5rem] overflow-hidden p-3 min-h-[200px]">
          {documents.length > 0 ? (
            documents.map((doc, idx) => (
              <div key={doc.id} className="group p-5 rounded-[1.5rem] flex items-center justify-between hover:bg-white/60 transition-all border border-transparent hover:border-white/50 mb-1 last:mb-0 cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${
                    doc.type === 'FATURA' ? 'bg-blue-50 text-brand-blue' : 
                    doc.type === 'DESPESA' ? 'bg-purple-50 text-brand-purple' : 'bg-neutral-100 text-neutral-medium'
                  }`}>
                    <FileText size={24} className="stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-dark text-base mb-0.5">{doc.title}</h4>
                    <p className="text-xs font-medium text-neutral-medium flex items-center gap-2">
                      {new Date(doc.date).toLocaleDateString('pt-PT')} 
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-medium/30"></span> 
                      {doc.type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`hidden md:inline-flex px-3 py-1.5 rounded-xl text-[11px] font-bold border ${
                     doc.status === DocStatus.APPROVED ? 'bg-green-50 text-status-success border-green-100' :
                     doc.status === DocStatus.PENDING ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                     doc.status === DocStatus.REJECTED ? 'bg-red-50 text-status-error border-red-100' : 'bg-blue-50 text-brand-blue border-blue-100'
                  }`}>
                    {doc.status}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-neutral-medium group-hover:text-brand-purple group-hover:shadow-md transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-neutral-light/50 rounded-2xl flex items-center justify-center mb-4">
                <FilePlus className="text-neutral-medium" size={32} />
              </div>
              <h4 className="text-lg font-bold text-neutral-dark">Nenhum documento ainda</h4>
              <p className="text-neutral-medium max-w-xs mb-6">Utilize o botão acima para enviar o seu primeiro documento.</p>
              <button onClick={triggerUpload} className="text-brand-blue font-bold text-sm hover:underline">
                Enviar agora
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardClient;