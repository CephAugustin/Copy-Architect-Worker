import React, { useState, useEffect } from 'react';
import { Folder, FileEntry } from './types';
import { saveFolder, fetchFolders, deleteFolder, saveFileEntry, fetchFiles, deleteFileEntry } from './dbService';
import { auth } from './firebase';
import { 
  Plus, 
  Folder as FolderIcon, 
  File as FileIcon, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Loader2, 
  FolderPlus, 
  FilePlus, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  Save 
} from 'lucide-react';

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
  const [fileContentInput, setFileContentInput] = useState('');
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);

  // File Preview / Edit Modal State
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [editFileName, setEditFileName] = useState('');
  const [editFileContent, setEditFileContent] = useState('');

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

    const contentText = fileContentInput.trim();
    const sizeInBytes = contentText ? contentText.length : Math.floor(Math.random() * 5000000) + 100000;

    const newFile: FileEntry = {
      fileId: Math.random().toString(36).substr(2, 9),
      userId,
      name: fileName.trim() + (fileName.includes('.') ? '' : '.txt'),
      folderId: currentFolderId || undefined,
      size: sizeInBytes,
      createdAt: Date.now(),
      content: contentText || undefined
    };
    await saveFileEntry(newFile);
    setFileName('');
    setFileContentInput('');
    setShowFileModal(false);
    loadData();
  };

  const handleSaveEditedFile = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !selectedFile || !editFileName.trim()) return;

    const updatedFile: FileEntry = {
      ...selectedFile,
      name: editFileName.trim(),
      content: editFileContent,
      size: editFileContent.length,
    };

    await saveFileEntry(updatedFile);
    setSelectedFile(updatedFile);
    setIsEditingFile(false);
    loadData();
  };

  const handleCopyFileContent = (content: string, id: string) => {
    navigator.clipboard.writeText(content || '');
    setCopiedFileId(id);
    setTimeout(() => {
      setCopiedFileId(null);
    }, 2000);
  };

  const handleDownloadFile = (file: FileEntry) => {
    const element = document.createElement("a");
    const blob = new Blob([file.content || ''], { type: "text/plain" });
    element.href = URL.createObjectURL(blob);
    element.download = file.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId || !showDeleteConfirm) return;

    if (showDeleteConfirm.type === 'folder') {
      await deleteFolder(userId, showDeleteConfirm.id);
    } else {
      await deleteFileEntry(userId, showDeleteConfirm.id);
      if (selectedFile?.fileId === showDeleteConfirm.id) {
        setSelectedFile(null);
      }
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
                  <p className="text-slate-600 text-xs font-medium">Upload or create your first asset to get started.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(file => (
                    <div 
                      key={file.fileId} 
                      onClick={() => {
                        setSelectedFile(file);
                        setIsEditingFile(false);
                        setEditFileName(file.name);
                        setEditFileContent(file.content || '');
                      }}
                      className="bg-[#0f172a]/60 border border-slate-800/60 rounded-3xl p-6 group hover:bg-slate-800/40 cursor-pointer hover:border-indigo-500/30 transition-all flex flex-col justify-between min-h-[180px] relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-indigo-500/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex justify-between items-start relative z-10">
                         <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                           <FileIcon size={24} />
                         </div>
                         <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleCopyFileContent(file.content || '', file.fileId)} 
                              title="Copy Content"
                              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/50 transition-all"
                            >
                              {copiedFileId === file.fileId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedFile(file);
                                setIsEditingFile(true);
                                setEditFileName(file.name);
                                setEditFileContent(file.content || '');
                              }} 
                              title="Edit"
                              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-indigo-500/50 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm({ type: 'file', id: file.fileId, name: file.name })} 
                              title="Delete"
                              className="p-2 text-slate-500 hover:text-red-500 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/50 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                      <div className="mt-4 relative z-10">
                         <h4 className="text-sm font-black text-white uppercase italic tracking-tight truncate">{file.name}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed italic h-8">
                           {file.content ? file.content : <span className="text-slate-600">No content (click to edit)</span>}
                         </p>
                         <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40">
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

      {/* Folders Modal */}
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

      {/* Add File Modal */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] w-full max-w-lg rounded-[2.5rem] border border-slate-800 shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Register File</h3>
              <button onClick={() => setShowFileModal(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">File Name *</label>
                <input 
                  value={fileName} 
                  onChange={e => setFileName(e.target.value)} 
                  autoFocus 
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-5 py-4 text-sm font-bold outline-none focus:border-indigo-500/50" 
                  placeholder="e.g. Q4_Strategy_Final" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2 mb-2 block">File Content</label>
                <textarea 
                  value={fileContentInput} 
                  onChange={e => setFileContentInput(e.target.value)} 
                  className="w-full h-48 bg-slate-950 border border-slate-800 text-white rounded-xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-500/50 resize-none leading-relaxed" 
                  placeholder="Write or paste campaign material, swipes, or brief guidelines here..." 
                />
              </div>
            </div>
            <div className="pt-4">
              <button 
                onClick={handleAddFile} 
                disabled={!fileName.trim()} 
                className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-lg"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

      {/* File Details / Preview / Edit Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-10 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                  <FileIcon size={28} />
                </div>
                <div className="min-w-0">
                  {isEditingFile ? (
                    <input
                      type="text"
                      value={editFileName}
                      onChange={(e) => setEditFileName(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-2 font-black text-lg uppercase tracking-tight italic outline-none focus:border-indigo-500/50 w-full max-w-md"
                      placeholder="File Name"
                    />
                  ) : (
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter truncate">{selectedFile.name}</h3>
                  )}
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    {formatSize(selectedFile.size)} • REGISTERED {new Date(selectedFile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end md:self-auto">
                {!isEditingFile ? (
                  <>
                    <button
                      onClick={() => handleCopyFileContent(selectedFile.content || '', selectedFile.fileId)}
                      className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/50 rounded-xl font-bold text-[11px] tracking-widest uppercase transition-all shadow-lg"
                    >
                      {copiedFileId === selectedFile.fileId ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy Content
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDownloadFile(selectedFile)}
                      className="flex items-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/50 rounded-xl font-bold text-[11px] tracking-widest uppercase transition-all shadow-lg"
                    >
                      <Download size={14} />
                      Download
                    </button>
                    <button
                      onClick={() => setIsEditingFile(true)}
                      className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[11px] tracking-widest uppercase transition-all shadow-lg"
                    >
                      <Edit2 size={14} />
                      Edit Content
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsEditingFile(false);
                        setEditFileName(selectedFile.name);
                        setEditFileContent(selectedFile.content || '');
                      }}
                      className="px-5 py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl font-bold text-[11px] tracking-widest uppercase transition-all border border-slate-700/50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEditedFile}
                      disabled={!editFileName.trim()}
                      className="flex items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-black text-[11px] tracking-widest uppercase transition-all shadow-lg"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedFile(null)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-white transition-all shadow-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col p-10 bg-slate-950/40">
              {isEditingFile ? (
                <textarea
                  value={editFileContent}
                  onChange={(e) => setEditFileContent(e.target.value)}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 text-white rounded-2xl p-8 font-mono text-sm leading-relaxed outline-none focus:border-indigo-500/50 resize-none shadow-inner"
                  placeholder="Paste or write file content here..."
                />
              ) : (
                <div className="w-full flex-1 bg-slate-950/80 border border-slate-850 rounded-2xl overflow-y-auto p-8 relative">
                  {selectedFile.content ? (
                    <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap break-words select-text selection:bg-indigo-500/20">
                      {selectedFile.content}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                      <div className="w-16 h-16 bg-slate-900/60 rounded-[2rem] flex items-center justify-center text-slate-700">
                        <FileText size={32} />
                      </div>
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-wider">Empty File</p>
                        <p className="text-slate-600 text-xs mt-1">This file has no saved content yet. Click edit to add text content.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
