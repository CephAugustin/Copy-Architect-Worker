import React, { useState, useEffect } from 'react';
import { KnowledgeEntry } from './types';
import { saveKnowledgeEntry, fetchKnowledgeEntries, deleteKnowledgeEntry, updateKnowledgeEntry } from './dbService';
import { auth } from './firebase';
import { Plus, Search, BookOpen, Tag, Clock, MoreVertical, Edit2, Trash2, X, Loader2, Filter, AlertCircle } from 'lucide-react';

const LABELS = [
  { id: 'email', label: 'Email', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'ads', label: 'Ads', color: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'vsl', label: 'VSL', color: 'bg-red-500/10 text-red-400' },
  { id: 'landing_page', label: 'Landing Page', color: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'general', label: 'General', color: 'bg-slate-500/10 text-slate-400' },
  { id: 'tactics', label: 'Tactics', color: 'bg-amber-500/10 text-amber-400' },
];

export default function KnowledgeBase({ onUpdate }: { onUpdate?: () => void }) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<KnowledgeEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<KnowledgeEntry | null>(null);
  const [showViewModal, setShowViewModal] = useState<KnowledgeEntry | null>(null);

  const [form, setForm] = useState({
    title: '',
    label: 'general' as KnowledgeEntry['label'],
    content: '',
    tags: '',
    priority: 3
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoading(true);
      const data = await fetchKnowledgeEntries(userId);
      setEntries(data);
      setLoading(false);
    }
  };

  const handleSave = async (isEdit: boolean) => {
    const userId = auth.currentUser?.uid;
    if (!userId || !form.title || !form.content) return;

    if (isEdit && showEditModal) {
      await updateKnowledgeEntry(userId, showEditModal.knowledgeId, {
        title: form.title,
        label: form.label,
        content: form.content,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        priority: form.priority
      });
      setShowEditModal(null);
    } else {
      const newEntry: KnowledgeEntry = {
        knowledgeId: Math.random().toString(36).substr(2, 9),
        userId,
        title: form.title,
        label: form.label,
        content: form.content,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        priority: form.priority,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await saveKnowledgeEntry(newEntry);
      setShowAddModal(false);
    }
    setForm({ title: '', label: 'general', content: '', tags: '', priority: 3 });
    loadEntries();
    if (onUpdate) onUpdate();
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && showDeleteConfirm) {
      await deleteKnowledgeEntry(userId, showDeleteConfirm.knowledgeId);
      setShowDeleteConfirm(null);
      loadEntries();
      if (onUpdate) onUpdate();
    }
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                         e.content.toLowerCase().includes(search.toLowerCase()) ||
                         e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === 'all' || e.label === filter;
    return matchesSearch && matchesFilter;
  });

  const PriorityBadge = ({ level }: { level: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className={`w-1.5 h-3 rounded-full ${i <= level ? 'bg-indigo-500' : 'bg-slate-800'}`}></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">My <span className="text-indigo-500">Knowledge Base</span></h2>
          <p className="text-slate-400 font-medium">Store your frameworks, tactics, and copywriting notes.</p>
        </div>
        <button
          onClick={() => { setForm({ title: '', label: 'general', content: '', tags: '', priority: 3 }); setShowAddModal(true); }}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl"
        >
          <Plus size={16} /> Add Knowledge
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search frameworks, tactics, tags..."
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
            {LABELS.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[400px] flex flex-col items-center justify-center text-center p-20 space-y-6">
          <div className="w-20 h-20 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center text-slate-700">
            <BookOpen size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">Base Empty</h4>
            <p className="text-slate-600 text-sm max-w-sm">No knowledge entries found matching your criteria.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map(entry => (
            <div 
              key={entry.knowledgeId} 
              onClick={() => setShowViewModal(entry)}
              className="bg-[#0f172a]/60 border border-slate-800/60 rounded-3xl p-6 hover:bg-[#1e293b]/60 transition-all group cursor-pointer flex flex-col justify-between min-h-[280px]"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${LABELS.find(l => l.id === entry.label)?.color}`}>
                    {LABELS.find(l => l.id === entry.label)?.label}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setForm({ title: entry.title, label: entry.label, content: entry.content || '', tags: (entry.tags || []).join(', '), priority: entry.priority || 3 }); setShowEditModal(entry); }} 
                       className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                     >
                       <Edit2 size={14} />
                     </button>
                     <button 
                       onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(entry); }} 
                       className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-xl font-black text-white mb-3 tracking-tight">{entry.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed italic">
                  {entry.content}
                </p>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {entry.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-[9px] font-bold text-slate-600 uppercase tracking-tighter bg-slate-800/40 px-2 py-0.5 rounded-md">
                        <Tag size={8} /> {tag}
                      </span>
                    ))}
                    {entry.tags.length > 3 && <span className="text-[9px] font-bold text-slate-700">+{entry.tags.length - 3} move</span>}
                  </div>
                )}
              </div>
              <div className="pt-6 border-t border-slate-800/40 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(entry.createdAt).toLocaleDateString()}</span>
                 </div>
                 <PriorityBadge level={entry.priority || 3} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                {showEditModal ? 'Update Knowledge' : 'Add New Knowledge'}
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Knowledge Title *</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    autoFocus 
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                    placeholder="e.g. PAS Framework" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Label Category *</label>
                  <select 
                    value={form.label} 
                    onChange={e => setForm({...form, label: e.target.value as any})} 
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50 appearance-none"
                  >
                    {LABELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Content / Framework Definition *</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})} 
                  rows={8}
                  className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-5 text-sm font-medium outline-none focus:border-indigo-500/50 resize-none leading-relaxed" 
                  placeholder="Paste the framework description markers, rules, or tactics here..." 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Tags (comma separated)</label>
                  <input 
                    value={form.tags} 
                    onChange={e => setForm({...form, tags: e.target.value})} 
                    className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                    placeholder="e.g. conversion, psychology, hook" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Priority Impact (1-5)</label>
                  <input 
                    type="range" min="1" max="5" 
                    value={form.priority} 
                    onChange={e => setForm({...form, priority: parseInt(e.target.value)})}
                    className="w-full mt-4 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                  />
                  <div className="flex justify-between px-1 text-[8px] font-black uppercase tracking-widest text-slate-600 mt-2">
                    <span>Low</span>
                    <span>High Impact</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8 bg-[#0a101f] border-t border-slate-800 flex gap-4">
              <button 
                onClick={() => { setShowAddModal(false); setShowEditModal(null); }} 
                className="flex-1 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-black text-xs tracking-widest uppercase text-slate-400 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSave(!!showEditModal)} 
                disabled={!form.title || !form.content}
                className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-lg"
              >
                {showEditModal ? 'Update Entry' : 'Save Framework'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white italic uppercase">Delete Entry?</h3>
              <p className="text-slate-500 text-sm font-medium">This cannot be undone. Are you sure you want to remove this knowledge entry?</p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={handleDelete} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Delete Permanently</button>
               <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Go Back</button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
             <div className="p-10 border-b border-slate-800 flex justify-between items-start gap-8">
                <div className="space-y-3">
                  <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${LABELS.find(l => l.id === showViewModal.label)?.color}`}>
                    {LABELS.find(l => l.id === showViewModal.label)?.label}
                  </div>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">{showViewModal.title}</h3>
                  <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Added {new Date(showViewModal.createdAt).toLocaleDateString()}</span>
                    </div>
                    <PriorityBadge level={showViewModal.priority || 3} />
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(null)} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all flex-shrink-0"
                >
                  <X size={24} />
                </button>
             </div>
             <div className="p-10 overflow-y-auto bg-slate-950/30">
                <div className="prose prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-slate-300 font-medium leading-relaxed font-serif text-lg italic opacity-90">
                    {showViewModal.content}
                  </div>
                </div>
                {showViewModal.tags && showViewModal.tags.length > 0 && (
                   <div className="mt-12 pt-8 border-t border-slate-800/60">
                      <div className="text-[10px] font-black uppercase text-slate-600 tracking-widest mb-4">Tags</div>
                      <div className="flex flex-wrap gap-3">
                        {showViewModal.tags.map(tag => (
                          <span key={tag} className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-4 py-2 rounded-xl">
                            <Tag size={12} /> {tag}
                          </span>
                        ))}
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
