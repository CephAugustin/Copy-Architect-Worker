import React, { useState, useEffect } from 'react';
import { SavedPrompt } from './types';
import { saveSavedPrompt, fetchSavedPrompts, deleteSavedPrompt, updateSavedPrompt } from './dbService';
import { auth } from './firebase';
import { Plus, Search, BookOpen, Clock, MoreVertical, Edit2, Trash2, X, Loader2, Filter, AlertCircle, Copy, Check, Terminal, Zap } from 'lucide-react';

const CATEGORIES = [
  { id: 'email', label: 'Email', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'ads', label: 'Ads', color: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'vsl', label: 'VSL', color: 'bg-red-500/10 text-red-400' },
  { id: 'landing_page', label: 'Landing Page', color: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'general', label: 'General', color: 'bg-slate-500/10 text-slate-400' },
  { id: 'system_prompt', label: 'System Prompt', color: 'bg-amber-500/10 text-amber-400' },
  { id: 'other', label: 'Other', color: 'bg-slate-500/10 text-slate-400' },
];

interface PromptsManagerProps {
  activeProtocol: SavedPrompt | null;
  onSelectProtocol: (prompt: SavedPrompt | null) => void;
}

export default function PromptsManager({ activeProtocol, onSelectProtocol }: PromptsManagerProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<SavedPrompt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<SavedPrompt | null>(null);
  const [showViewModal, setShowViewModal] = useState<SavedPrompt | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'general' as SavedPrompt['category'],
    content: ''
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoading(true);
      const data = await fetchSavedPrompts(userId);
      setPrompts(data);
      setLoading(false);
    }
  };

  const handleSave = async (isEdit: boolean) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !form.title || !form.content) return;

    if (isEdit && showEditModal) {
      await updateSavedPrompt(userId, showEditModal.promptId, {
        title: form.title,
        category: form.category,
        content: form.content
      });
      setShowEditModal(null);
    } else {
      const newPrompt: SavedPrompt = {
        promptId: Math.random().toString(36).substr(2, 9),
        userId,
        title: form.title,
        category: form.category,
        content: form.content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await saveSavedPrompt(newPrompt);
      setShowAddModal(false);
    }
    setForm({ title: '', category: 'general', content: '' });
    loadPrompts();
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && showDeleteConfirm) {
      await deleteSavedPrompt(userId, showDeleteConfirm.promptId);
      setShowDeleteConfirm(null);
      loadPrompts();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPrompts = prompts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                         p.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Saved <span className="text-indigo-500">Prompts</span></h2>
          <p className="text-slate-400 font-medium">Your library of elite copywriting prompts and system instructions.</p>
        </div>
        <button
          onClick={() => { setForm({ title: '', category: 'general', content: '' }); setShowAddModal(true); }}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl"
        >
          <Plus size={16} /> New Prompt
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
          />
        </div>
        <div className="relative min-w-[200px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
            <Filter size={18} />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-bold appearance-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[400px] flex flex-col items-center justify-center text-center p-20 space-y-6">
          <div className="w-20 h-20 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center text-slate-700">
            <Terminal size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">No Prompts</h4>
            <p className="text-slate-600 text-sm max-w-sm">No saved prompts found. Start by creating a new elite protocol.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(prompt => (
            <div 
              key={prompt.promptId} 
              onClick={() => setShowViewModal(prompt)}
              className={`bg-[#0f172a]/60 border rounded-3xl p-6 hover:bg-[#1e293b]/60 transition-all group cursor-pointer flex flex-col justify-between min-h-[280px] ${activeProtocol?.promptId === prompt.promptId ? 'border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.2)]' : 'border-slate-800/60'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${CATEGORIES.find(c => c.id === prompt.category)?.color}`}>
                    {CATEGORIES.find(c => c.id === prompt.category)?.label}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button 
                       onClick={(e) => { e.stopPropagation(); copyToClipboard(prompt.content, prompt.promptId); }} 
                       className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                       title="Copy Prompt"
                     >
                       {copiedId === prompt.promptId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setForm({ title: prompt.title, category: prompt.category, content: prompt.content }); setShowEditModal(prompt); }} 
                       className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                     >
                       <Edit2 size={14} />
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(prompt); }} 
                       className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-xl font-black text-white mb-3 tracking-tight">{prompt.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed italic">
                  {prompt.content}
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-slate-800/40 flex flex-col gap-4">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (activeProtocol?.promptId === prompt.promptId) {
                      onSelectProtocol(null);
                    } else {
                      onSelectProtocol(prompt);
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeProtocol?.promptId === prompt.promptId 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                      : 'bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  {activeProtocol?.promptId === prompt.promptId ? (
                    <><Check size={14} /> Protocol Active</>
                  ) : (
                    <><Zap size={14} fill="currentColor" /> Use Protocol</>
                  )}
                </button>
                <div className="flex justify-between items-center text-slate-600 px-1">
                  <div className="flex items-center gap-2">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                {showEditModal ? 'Update Prompt' : 'New Saved Prompt'}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(null); }} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Prompt Title *</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    autoFocus 
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                    placeholder="e.g. PAS Email Framework" 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Category *</label>
                  <div className="relative">
                    <select 
                      value={form.category} 
                      onChange={e => setForm({...form, category: e.target.value as any})} 
                      className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 appearance-none h-[54px]"
                    >
                      {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="bg-[#0f172a]">{cat.label}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                       <Filter size={14} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Prompt Content *</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})} 
                  rows={10}
                  className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-5 text-sm font-medium outline-none focus:border-indigo-500/50 resize-none leading-relaxed font-serif italic" 
                  placeholder="Paste your prompt text here..." 
                />
              </div>
            </div>
            <div className="p-8 bg-[#0a101f] border-t border-slate-800 flex gap-4">
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(null); }} 
                className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-xs tracking-widest uppercase text-slate-400 hover:text-white transition-all text-center"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSave(!!showEditModal)} 
                disabled={!form.title || !form.content}
                className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-lg text-center"
              >
                {showEditModal ? 'Update Prompt' : 'Save Protocol'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Delete Prompt?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">This cannot be undone. Are you sure you want to remove this elite protocol?</p>
            </div>
            <div className="flex flex-col gap-3 pt-4">
               <button onClick={handleDelete} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-lg shadow-red-900/20">Delete Permanently</button>
               <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all border border-slate-800">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
             <div className="p-10 border-b border-slate-800 flex justify-between items-start gap-8">
                <div className="space-y-3">
                  <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${CATEGORIES.find(c => c.id === showViewModal.category)?.color}`}>
                    {CATEGORIES.find(c => c.id === showViewModal.category)?.label}
                  </div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">{showViewModal.title}</h3>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Added {new Date(showViewModal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => copyToClipboard(showViewModal.content, showViewModal.promptId)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all flex-shrink-0"
                  >
                    {copiedId === showViewModal.promptId ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                  <button 
                    onClick={() => setShowViewModal(null)} 
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all flex-shrink-0"
                  >
                    <X size={24} />
                  </button>
                </div>
             </div>
             <div className="p-10 overflow-y-auto bg-slate-950/30">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-300 font-medium leading-relaxed font-serif text-lg italic opacity-90">
                    {showViewModal.content}
                  </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
