import React, { useState, useEffect } from 'react';
import { TeamMember } from './types';
import { saveTeamMember, fetchTeamMembers, deleteTeamMember } from './dbService';
import { auth } from './firebase';
import { Plus, Users, User, Trash2, X, Loader2, Shield, Search, MoreVertical, Briefcase } from 'lucide-react';

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TeamMember | null>(null);

  const [form, setForm] = useState({ name: '', role: '' });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoading(true);
      const data = await fetchTeamMembers(userId);
      setMembers(data);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !form.name.trim()) return;

    const newMember: TeamMember = {
      memberId: Math.random().toString(36).substr(2, 9),
      userId,
      name: form.name.trim(),
      role: form.role.trim() || 'Contributor',
      createdAt: Date.now()
    };
    await saveTeamMember(newMember);

    setShowModal(false);
    setForm({ name: '', role: '' });
    loadMembers();
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && showDeleteConfirm) {
      await deleteTeamMember(userId, showDeleteConfirm.memberId);
      setShowDeleteConfirm(null);
      loadMembers();
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Team <span className="text-indigo-500">Members</span></h2>
          <p className="text-slate-400 font-medium">Manage collaborators and designate project roles.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl"
        >
          <Plus size={16} /> Add Member
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Filter team by name or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[400px] flex flex-col items-center justify-center text-center p-20 space-y-6">
          <div className="w-20 h-20 bg-slate-900/60 rounded-[2.5rem] flex items-center justify-center text-slate-700">
            <Users size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">No Team Members</h4>
            <p className="text-slate-600 text-sm max-w-sm">Build your elite copywriting squad by adding members.</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[2rem] overflow-hidden backdrop-blur-xl">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-800/60 bg-slate-900/20">
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Member</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Joined</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                 {filteredMembers.map(member => (
                   <tr key={member.memberId} className="group hover:bg-slate-800/20 transition-all">
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                               <User size={20} />
                            </div>
                            <span className="text-sm font-black text-white uppercase italic tracking-tight">{member.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/40 rounded-full w-fit">
                            <Briefcase size={10} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.role}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(member.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <button onClick={() => setShowDeleteConfirm(member)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Invite Member</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Full Name *</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  autoFocus 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                  placeholder="e.g. John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 block">Designated Role</label>
                <input 
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                  placeholder="e.g. Lead Copywriter" 
                />
              </div>
            </div>
            <div className="mt-8">
              <button 
                onClick={handleSave} 
                disabled={!form.name.trim()} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-lg"
              >
                Add Member
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
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Remove Member?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Are you sure you want to remove <span className="text-white">"{showDeleteConfirm.name}"</span> from your team records?</p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={handleDelete} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Remove</button>
               <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
