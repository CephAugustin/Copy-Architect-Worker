import React, { useState, useEffect } from 'react';
import { Note } from './types';
import { saveNote, fetchNotes, deleteNote, updateNote } from './dbService';
import { auth } from './firebase';
import { Plus, StickyNote, Trash2, Edit2, X, Loader2, Save, Clock, Search } from 'lucide-react';

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Note | null>(null);

  const [form, setForm] = useState({ title: '', content: '' });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoading(true);
      const data = await fetchNotes(userId);
      setNotes(data);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !form.title.trim()) return;

    if (editNote) {
      await updateNote(userId, editNote.noteId, { title: form.title, content: form.content });
    } else {
      const newNote: Note = {
        noteId: Math.random().toString(36).substr(2, 9),
        userId,
        title: form.title,
        content: form.content,
        createdAt: Date.now()
      };
      await saveNote(newNote);
    }

    setShowModal(false);
    setEditNote(null);
    setForm({ title: '', content: '' });
    loadNotes();
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && showDeleteConfirm) {
      await deleteNote(userId, showDeleteConfirm.noteId);
      setShowDeleteConfirm(null);
      loadNotes();
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">My <span className="text-indigo-500">Notes</span></h2>
          <p className="text-slate-400 font-medium">Capture ideas, draft scratchpad concepts, and brain-dump.</p>
        </div>
        <button
          onClick={() => { setEditNote(null); setForm({ title: '', content: '' }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search through notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[500px] flex flex-col items-center justify-center text-center p-20 space-y-6">
          <div className="w-20 h-20 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center text-slate-700">
            <StickyNote size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">No Notes Found</h4>
            <p className="text-slate-600 text-sm max-w-sm">Capture your first idea by creating a new note above.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map(note => (
            <div key={note.noteId} className="bg-[#0f172a]/60 border border-slate-800/60 rounded-3xl p-8 hover:bg-[#1e293b]/60 transition-all group flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                    <StickyNote size={24} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button onClick={() => { setEditNote(note); setForm({ title: note.title, content: note.content || '' }); setShowModal(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Edit2 size={16} /></button>
                     <button onClick={() => setShowDeleteConfirm(note)} className="p-2 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
                <h3 className="line-clamp-2 text-2xl font-black text-white tracking-tight uppercase italic mb-2">{note.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-6 font-medium leading-relaxed italic">{note.content || 'Click edit to add content...'}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/40">
                 <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Added {new Date(note.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-2xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{editNote ? 'Edit Note' : 'Create Note'}</h3>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8 overflow-y-auto flex-1">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Note Title *</label>
                <input 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                  autoFocus 
                  className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-4 text-sm font-bold shadow-inner outline-none focus:border-indigo-500/50" 
                  placeholder="The Core Concept..." 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Detailed Content</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})} 
                  className="w-full h-80 bg-slate-950/60 border border-slate-800 text-white rounded-2xl px-6 py-6 text-sm font-medium outline-none focus:border-indigo-500/50 resize-none leading-relaxed italic" 
                  placeholder="Start writing..." 
                />
              </div>
            </div>
            <div className="p-10 bg-[#0a101f] border-t border-slate-800">
              <button 
                onClick={handleSave} 
                disabled={!form.title.trim()} 
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Save size={18} />
                {editNote ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
              <Trash2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Discard Note?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Are you sure you want to delete <span className="text-white">"{showDeleteConfirm.title}"</span>? This cannot be undone.</p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={handleDelete} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Yes, Discard</button>
               <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Keep it</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
