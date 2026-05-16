import React, { useState, useEffect } from 'react';
import { Folder, FileEntry } from './types';
import { saveFolder, fetchFolders, deleteFolder, saveFileEntry, fetchFiles, deleteFileEntry } from './dbService';
import { auth } from './firebase';
import { Plus, Folder as FolderIcon, File as FileIcon, Search, MoreVertical, Edit2, Trash2, X, Loader2, Filter, FolderPlus, FilePlus, ChevronRight, ArrowLeft, Clock, Monitor } from 'lucide-react';

export default function FileManager() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'folder' | 'file', id: string, name: string } | null>(null);

  const [folderName, setFolderName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.2 MB');

  useEffect(() => {
    loadData();
  }, [currentFolderId]);

  const loadData = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      setLoading(true);
      const [foldersData, filesData] = await Promise.all([
        fetchFolders(userId),
        fetchFiles(userId, currentFolderId || undefined)
      ]);
      setFolders(foldersData);
      setFiles(filesData);
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !folderName.trim()) return;

    const newFolder: Folder = {
      folderId: Math.random().toString(36).substr(2, 9),
      userId,
      name: folderName.trim(),
      createdAt: Date.now()
    };
    await saveFolder(newFolder);
    setFolderName('');
    setShowFolderModal(false);
    loadData();
  };

  const handleAddFile = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !fileName.trim()) return;

    // Simulate file size as number
    const sizeInBytes = Math.floor(Math.random() * 5000000) + 100000;

    const newFile: FileEntry = {
      fileId: Math.random().toString(36).substr(2, 9),
      userId,
      name: fileName.trim(),
      folderId: currentFolderId || undefined,
      size: sizeInBytes,
      createdAt: Date.now()
    };
    await saveFileEntry(newFile);
    setFileName('');
    setShowFileModal(false);
    loadData();
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !showDeleteConfirm) return;

    if (showDeleteConfirm.type === 'folder') {
      await deleteFolder(userId, showDeleteConfirm.id);
    } else {
      await deleteFileEntry(userId, showDeleteConfirm.id);
    }
    setShowDeleteConfirm(null);
    loadData();
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
             {currentFolderId && (
               <button onClick={() => setCurrentFolderId(null)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all mr-2">
                  <ArrowLeft size={16} />
               </button>
             )}
             <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">My <span className="text-indigo-500">Files</span></h2>
          </div>
          <p className="text-slate-400 font-medium">{currentFolderId ? `Viewing items in folder` : 'Store assets, swipe files, and campaign collateral.'}</p>
        </div>
        <div className="flex gap-4">
           <button
            onClick={() => setShowFolderModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl"
          >
            <FolderPlus size={16} /> New Folder
          </button>
          <button
            onClick={() => setShowFileModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl"
          >
            <FilePlus size={16} /> Add File
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search folders and files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Folders Section - only show in root or if searching */}
          {(!currentFolderId || search) && folders.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] font-sans">Folders</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(folder => (
                  <div 
                    key={folder.folderId}
                    onClick={() => { setCurrentFolderId(folder.folderId); setSearch(''); }}
                    className="bg-[#0f172a]/60 border border-slate-800/60 rounded-3xl p-6 group cursor-pointer hover:bg-slate-800/40 transition-all flex items-center gap-4 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                      <FolderIcon size={24} fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-black text-sm uppercase italic tracking-tight truncate">{folder.name}</h4>
                      <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-0.5">Asset Collection</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm({ type: 'folder', id: folder.folderId, name: folder.name }); }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 transition-all relative z-10"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={16} className="text-slate-800 group-hover:text-indigo-500 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] font-sans">Files {currentFolderId ? 'in this folder' : 'in root'}</h3>
            {files.length === 0 ? (
              <div className="bg-[#0f172a]/40 border border-slate-800/40 rounded-[3rem] h-[300px] flex flex-col items-center justify-center text-center p-12 space-y-4">
                <div className="w-16 h-16 bg-slate-900/60 rounded-[2rem] flex items-center justify-center text-slate-700">
                  <FileIcon size={32} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white italic uppercase">No Files Found</h4>
                  <p className="text-slate-600 text-xs font-medium">Upload your first asset to get started.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(file => (
                   <div key={file.fileId} className="bg-[#0f172a]/60 border border-slate-800/60 rounded-3xl p-6 group hover:bg-[#1e293b]/60 transition-all flex flex-col justify-between min-h-[160px]">
                      <div className="flex justify-between items-start">
                         <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                           <FileIcon size={24} />
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => setShowDeleteConfirm({ type: 'file', id: file.fileId, name: file.name })} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                         </div>
                      </div>
                      <div className="mt-4">
                         <h4 className="text-sm font-black text-white uppercase italic tracking-tight truncate">{file.name}</h4>
                         <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 text-slate-600">
                               <Clock size={10} />
                               <span className="text-[9px] font-black uppercase tracking-widest">{new Date(file.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{formatSize(file.size)}</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">New Collection</h3>
              <button onClick={() => setShowFolderModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">Folder Name *</label>
                <input 
                  value={folderName} 
                  onChange={e => setFolderName(e.target.value)} 
                  autoFocus 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                  placeholder="e.g. Swipe Files" 
                />
              </div>
            </div>
            <div className="mt-8">
              <button 
                onClick={handleCreateFolder} 
                disabled={!folderName.trim()} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-sm rounded-[2rem] border border-slate-800 shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Register File</h3>
              <button onClick={() => setShowFileModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">File Name *</label>
                <input 
                  value={fileName} 
                  onChange={e => setFileName(e.target.value)} 
                  autoFocus 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                  placeholder="e.g. Q4_Strategy_Final.pdf" 
                />
              </div>
            </div>
            <div className="mt-8">
              <button 
                onClick={handleAddFile} 
                disabled={!fileName.trim()} 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all"
              >
                Register File
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
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Remove Item?</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Are you sure you want to delete <span className="text-white">"{showDeleteConfirm.name}"</span>? This action cannot be undone.</p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={handleDelete} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Yes, Delete</button>
               <button onClick={() => setShowDeleteConfirm(null)} className="w-full py-4 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
