import { auth, db } from './firebase';
import { collection, doc, setDoc, getDocs, query, where, deleteDoc, updateDoc, getDocFromServer, orderBy } from 'firebase/firestore';
import { UserProfile, KnowledgeEntry, Folder, FileEntry, Note, TeamMember, SavedPrompt } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    // We don't throw here as it's just a connection test
  }
}
testConnection();

// Hashing utility
export const hashPasskey = async (passkey: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(passkey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Users
export const createUserProfile = async (user: UserProfile) => {
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docSnap = await getDocFromServer(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    return null;
  }
};

// Knowledge Base
export const saveKnowledgeEntry = async (entry: KnowledgeEntry) => {
  const path = `users/${entry.userId}/knowledge/${entry.knowledgeId}`;
  try {
    await setDoc(doc(db, 'users', entry.userId, 'knowledge', entry.knowledgeId), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchKnowledgeEntries = async (userId: string): Promise<KnowledgeEntry[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'knowledge'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const entries: KnowledgeEntry[] = [];
    querySnapshot.forEach((doc) => {
      entries.push(doc.data() as KnowledgeEntry);
    });
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/knowledge`);
    return [];
  }
};

export const deleteKnowledgeEntry = async (userId: string, knowledgeId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'knowledge', knowledgeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/knowledge/${knowledgeId}`);
  }
};

export const updateKnowledgeEntry = async (userId: string, knowledgeId: string, updates: Partial<KnowledgeEntry>) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'knowledge', knowledgeId), { ...updates, updatedAt: Date.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/knowledge/${knowledgeId}`);
  }
};

// Folders
export const saveFolder = async (folder: Folder) => {
  try {
    await setDoc(doc(db, 'users', folder.userId, 'folders', folder.folderId), folder);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${folder.userId}/folders/${folder.folderId}`);
  }
};

export const fetchFolders = async (userId: string): Promise<Folder[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'folders'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const folders: Folder[] = [];
    querySnapshot.forEach((doc) => {
      folders.push(doc.data() as Folder);
    });
    return folders;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/folders`);
    return [];
  }
};

export const deleteFolder = async (userId: string, folderId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'folders', folderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/folders/${folderId}`);
  }
};

// Files
export const saveFileEntry = async (file: FileEntry) => {
  try {
    await setDoc(doc(db, 'users', file.userId, 'files', file.fileId), file);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${file.userId}/files/${file.fileId}`);
  }
};

export const fetchFiles = async (userId: string, folderId?: string): Promise<FileEntry[]> => {
  try {
    let q = query(collection(db, 'users', userId, 'files'), orderBy('createdAt', 'desc'));
    if (folderId) {
      q = query(collection(db, 'users', userId, 'files'), where('folderId', '==', folderId), orderBy('createdAt', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    const files: FileEntry[] = [];
    querySnapshot.forEach((doc) => {
      files.push(doc.data() as FileEntry);
    });
    return files;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/files`);
    return [];
  }
};

export const deleteFileEntry = async (userId: string, fileId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'files', fileId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/files/${fileId}`);
  }
};

// Notes
export const saveNote = async (note: Note) => {
  try {
    await setDoc(doc(db, 'users', note.userId, 'notes', note.noteId), note);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${note.userId}/notes/${note.noteId}`);
  }
};

export const fetchNotes = async (userId: string): Promise<Note[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'notes'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const notes: Note[] = [];
    querySnapshot.forEach((doc) => {
      notes.push(doc.data() as Note);
    });
    return notes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/notes`);
    return [];
  }
};

export const deleteNote = async (userId: string, noteId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'notes', noteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/notes/${noteId}`);
  }
};

export const updateNote = async (userId: string, noteId: string, updates: Partial<Note>) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'notes', noteId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/notes/${noteId}`);
  }
};

// Team Members
export const saveTeamMember = async (member: TeamMember) => {
  try {
    await setDoc(doc(db, 'users', member.userId, 'teamMembers', member.memberId), member);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${member.userId}/teamMembers/${member.memberId}`);
  }
};

export const fetchTeamMembers = async (userId: string): Promise<TeamMember[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'teamMembers'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const members: TeamMember[] = [];
    querySnapshot.forEach((doc) => {
      members.push(doc.data() as TeamMember);
    });
    return members;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/teamMembers`);
    return [];
  }
};

export const deleteTeamMember = async (userId: string, memberId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'teamMembers', memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/teamMembers/${memberId}`);
  }
};

// Saved Prompts
export const saveSavedPrompt = async (prompt: SavedPrompt) => {
  const path = `users/${prompt.userId}/savedPrompts/${prompt.promptId}`;
  try {
    await setDoc(doc(db, 'users', prompt.userId, 'savedPrompts', prompt.promptId), prompt);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const fetchSavedPrompts = async (userId: string): Promise<SavedPrompt[]> => {
  try {
    const q = query(collection(db, 'users', userId, 'savedPrompts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const prompts: SavedPrompt[] = [];
    querySnapshot.forEach((doc) => {
      prompts.push(doc.data() as SavedPrompt);
    });
    return prompts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${userId}/savedPrompts`);
    return [];
  }
};

export const deleteSavedPrompt = async (userId: string, promptId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId, 'savedPrompts', promptId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}/savedPrompts/${promptId}`);
  }
};

export const updateSavedPrompt = async (userId: string, promptId: string, updates: Partial<SavedPrompt>) => {
  try {
    await updateDoc(doc(db, 'users', userId, 'savedPrompts', promptId), { ...updates, updatedAt: Date.now() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/savedPrompts/${promptId}`);
  }
};
