
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import type { Note, Theme, View, ChatSession } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import Dashboard from './components/Dashboard';
import NoteEditor from './components/NoteEditor';
import AiChat from './components/AiChat';
import Settings from './components/Settings';
import FullScreenClock from './components/FullScreenClock';
import BottomNav from './components/BottomNav';

interface UserData {
  name: string;
  pin: string;
}

interface AppSettings {
  theme: Theme;
}

interface AppContextType {
  user: UserData | null;
  notes: Note[];
  chatSessions: ChatSession[];
  settings: AppSettings;
  view: View;
  setView: (view: View, noteToEdit?: Note) => void;
  saveUser: (user: UserData) => void;
  saveNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  saveSettings: (settings: AppSettings) => void;
  createNoteFromAiContent: (content: string) => void;
  saveChatSession: (session: ChatSession) => void;
  deleteChatSession: (sessionId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};


const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ theme: 'system' as Theme });
  const [view, setView] = useState<View>('dashboard');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  
  const applyTheme = useCallback((theme: Theme) => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, []);


  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mragenda_user');
      const storedNotes = localStorage.getItem('mragenda_notes');
      const storedSettings = localStorage.getItem('mragenda_settings');
      const storedChats = localStorage.getItem('mragenda_chats');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setView('welcome');
      }

      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }

       if (storedChats) {
        setChatSessions(JSON.parse(storedChats));
      }

      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        applyTheme(parsedSettings.theme);
      } else {
        applyTheme('system' as Theme);
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setView('welcome');
    } finally {
        setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      if (isInitialized && user) {
          localStorage.setItem('mragenda_user', JSON.stringify(user));
      }
  }, [user, isInitialized]);

  useEffect(() => {
      if (isInitialized) {
        localStorage.setItem('mragenda_notes', JSON.stringify(notes));
      }
  }, [notes, isInitialized]);

    useEffect(() => {
      if (isInitialized) {
        localStorage.setItem('mragenda_chats', JSON.stringify(chatSessions));
      }
  }, [chatSessions, isInitialized]);


  useEffect(() => {
      if (isInitialized) {
        localStorage.setItem('mragenda_settings', JSON.stringify(settings));
        applyTheme(settings.theme);
      }
  }, [settings, isInitialized, applyTheme]);

  // Reminder checking logic
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const interval = setInterval(() => {
        const now = new Date();
        notesRef.current.forEach(note => {
            if (note.reminder) {
                const reminderDate = new Date(note.reminder);
                const triggeredKey = `reminder_triggered_${note.id}`;
                
                if (reminderDate <= now && !localStorage.getItem(triggeredKey)) {
                    console.log('Triggering reminder for:', note.title);
                    
                    audioRef.current?.play().catch(e => console.error("Error playing sound:", e));
                    
                    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
                        new Notification('MrAgenda Hatırlatıcı', {
                            body: note.title,
                            icon: "data:image/svg+xml,%3csvg width='64' height='64' viewBox='0 0 64 64' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:rgb(30, 64, 175);stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:rgb(107, 33, 168);stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='64' height='64' rx='12' fill='url(%23grad1)'/%3e%3cpath d='M14 46V18H22L32 34L42 18H50V46H44V26L34 42H30L20 26V46H14Z' fill='white'/%3e%3c/svg%3e",
                        });
                    } else {
                        const contentPreview = (note.content || '').replace(/<[^>]*>?/gm, '').substring(0, 100);
                        alert(`Hatırlatıcı: ${note.title}\n\n${contentPreview}...`);
                    }
                    
                    localStorage.setItem(triggeredKey, 'true');
                }
            }
        });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);


  const saveUser = (userData: UserData) => {
    setUser(userData);
    setView('dashboard');
  };

  const saveNote = (note: Note) => {
    const oldNote = notes.find(n => n.id === note.id);
    if(oldNote && oldNote.reminder !== note.reminder) {
        localStorage.removeItem(`reminder_triggered_${note.id}`);
    } else if (!note.reminder) {
        localStorage.removeItem(`reminder_triggered_${note.id}`);
    }

    setNotes(prevNotes => {
      const existing = prevNotes.find(n => n.id === note.id);
      if (existing) {
        return prevNotes.map(n => n.id === note.id ? note : n);
      }
      return [...prevNotes, note];
    });
    setEditingNote(null);
    setView('dashboard');
  };

  const saveChatSession = (session: ChatSession) => {
    setChatSessions(prevSessions => {
      const existing = prevSessions.find(s => s.id === session.id);
      let newSessions;
      if (existing) {
        newSessions = prevSessions.map(s => s.id === session.id ? session : s);
      } else {
        newSessions = [...prevSessions, session];
      }
      return newSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  };

  const deleteChatSession = (sessionId: string) => {
    setChatSessions(prevSessions => prevSessions.filter(s => s.id !== sessionId));
  };


  const deleteNote = (noteId: string) => {
    localStorage.removeItem(`reminder_triggered_${noteId}`);
    setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
  };
  
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };
  
  const handleSetView = (newView: View, noteToEdit?: Note) => {
      if (newView === 'editor') {
          setEditingNote(noteToEdit || null);
      }
      setView(newView);
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    setView('dashboard');
  };

  const createNoteFromAiContent = (content: string) => {
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'AI Tarafından Oluşturulan Not',
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isImportant: false,
      isSecret: false,
    };
    setEditingNote(newNote);
    setView('editor');
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        return <WelcomeScreen onSave={saveUser} />;
      case 'dashboard':
        return <Dashboard onEditNote={(note) => handleSetView('editor', note)} />;
      case 'editor':
        return <NoteEditor note={editingNote} onSave={saveNote} onCancel={() => setView('dashboard')} onDelete={handleDeleteNote} />;
      case 'chat':
        return <AiChat />;
      case 'clock':
        return <FullScreenClock />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onEditNote={(note) => handleSetView('editor', note)} />;
    }
  };

  if (!isInitialized) {
      return (
          <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
              <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200">MrAgenda Yükleniyor...</div>
          </div>
      )
  }

  if (!user && view !== 'welcome') {
      return <WelcomeScreen onSave={saveUser} />;
  }

  return (
    <AppContext.Provider value={{ user, notes, settings, view, chatSessions, setView: handleSetView, saveUser, saveNote, deleteNote, saveSettings, createNoteFromAiContent, saveChatSession, deleteChatSession }}>
        <div className="font-sans antialiased text-gray-900 bg-gray-100 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
          <main className="pb-20">
            {renderView()}
          </main>
          {user && view !== 'welcome' && <BottomNav />}
          <audio ref={audioRef} src="data:audio/mpeg;base64,SUQzBAAAAAAB9B4ARNABMExBTUUzLjk4LjIAAAAAAAAAAAAAAENDUgEAAAABAAAAA//uAAADyIAAAAAAAA4AAAAAYAAAD/84CAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMP1AAAAP8AAAAAE/Lg3/AAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8A3//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA5//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MA7/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QA9/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//YA///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8A///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//4A/f/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QB///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//YA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//YA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8A///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8A///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/8A3//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA5//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MA7/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QA9/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//YA///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8A///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//4A/f/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QB///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//YA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//QA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//YA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//AA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//gA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//MA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8A///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8A///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sA///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" preload="auto" style={{ display: 'none' }}></audio>
        </div>
    </AppContext.Provider>
  );
};

export default App;