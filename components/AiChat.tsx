import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { generatePlanStream } from '../services/geminiService';
import { useAppContext } from '../App';
import type { ChatMessage, ChatSession } from '../types';
import Typewriter from './Typewriter'; 

// --- Simgeler ---
const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const AiIcon = () => (
     <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-white text-xs font-bold shrink-0 shadow-md border border-gray-300 dark:border-gray-600">
        AI
    </div>
);


// --- Bileşenler ---

const formatMarkdownToHtml = (text: string) => {
    const escapeHtml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const parts = text.split(/(```[\s\S]*?```)/g);

    const html = parts.map((part) => {
        if (!part) return '';
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.substring(3, part.length - 3).trim();
            return `<pre class="bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto text-sm font-mono border border-gray-200 dark:border-gray-700"><code>${escapeHtml(code)}</code></pre>`;
        }

        let regularHtml = part
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold">$1</h1>')
            .replace(/^\s*---*\s*$/gim, '<hr class="my-4 border-gray-200 dark:border-gray-700" />')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br />');

        regularHtml = regularHtml.replace(/<br \/>\s*<(h[1-3]|hr|pre)/g, '<$1');
        regularHtml = regularHtml.replace(/<\/(h[1-3]|pre)>/g, '</$1>');
        
        return regularHtml;
    }).join('');
    
    return html.replace(/(<\/pre>)\s*<br \/>/g, '$1');
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-gray-800 dark:prose-p:text-gray-300" dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(content) }} />;
};

const ChatMessageItem: React.FC<{ message: ChatMessage; isStreaming?: boolean }> = ({ message, isStreaming }) => {
    const { createNoteFromAiContent } = useAppContext();
    
    const handleSaveNote = (content: string) => {
        const htmlContent = formatMarkdownToHtml(content);
        createNoteFromAiContent(htmlContent);
    };

    return (
        <div className={`w-full flex my-4 animate-fade-in ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl flex items-start gap-4 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {!message.isUser && <AiIcon />}
                <div className={`pt-0.5 ${message.isUser ? 'text-right' : 'text-left'}`}>
                    {isStreaming ? <Typewriter text={message.text} isStreaming={isStreaming} /> : <MarkdownRenderer content={message.text} />}
                    {!message.isUser && message.text && !isStreaming && (
                        <button onClick={() => handleSaveNote(message.text)} className="mt-3 px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                            Nota Aktar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChatView: React.FC<{
    session: ChatSession;
    onBack: () => void;
    onSendMessage: (message: string, session: ChatSession) => Promise<void>;
    isLoading: boolean;
    onToggleSidebar: () => void;
    isMobile: boolean;
}> = ({ session, onBack, onSendMessage, isLoading, onToggleSidebar, isMobile }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [session.messages]);
    
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 200; // max height 200px
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
        }
    }, [input]);

    const handleSend = () => {
        if (input.trim() === '' || isLoading) return;
        onSendMessage(input.trim(), session);
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.overflowY = 'hidden';
        }
    };
    
    return (
        <div className="relative flex flex-col w-full h-full">
            <header className="absolute top-0 left-0 right-0 z-30 flex items-center p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                <button onClick={isMobile ? onBack : onToggleSidebar} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    {isMobile ? <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> : <MenuIcon />}
                </button>
                <h1 className="text-lg font-semibold truncate">{session.title}</h1>
            </header>

            <div className="flex-grow pt-20 pb-36 overflow-y-auto px-4" style={{ maskImage: 'linear-gradient(to top, black 25%, transparent 100%)' }}>
                 {session.messages.map((msg, index) => (
                    <ChatMessageItem key={index} message={msg} isStreaming={isLoading && !msg.isUser && index === session.messages.length - 1} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 shrink-0 bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent">
                 <div className="flex items-end bg-gray-100 dark:bg-slate-800/80 rounded-2xl shadow-2xl p-2 border border-gray-300 dark:border-slate-700 backdrop-blur-sm">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Merak ettiğin bir şeyi sor..."
                        className="flex-grow p-2 bg-transparent focus:outline-none text-gray-800 dark:text-gray-200 resize-none max-h-[200px] placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        className="p-2 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-all duration-200 ml-2 shrink-0 self-end disabled:opacity-50"
                        disabled={isLoading || !input.trim()}
                        aria-label="Gönder"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChatList: React.FC<{
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelect: (id: string) => void;
    onNew: () => void;
    onDelete: (id: string) => void;
}> = ({ sessions, activeSessionId, onSelect, onNew, onDelete }) => {
    return (
       <div className="w-full h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                 <h2 className="text-xl font-bold">Sohbetler</h2>
                <button onClick={onNew} className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:bg-blue-900/50 dark:hover:bg-blue-800/70" title="Yeni Sohbet">
                    <PlusIcon />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
                {sessions.map(session => (
                    <div key={session.id} onClick={() => onSelect(session.id)} className={`p-3 rounded-lg cursor-pointer group relative transition-colors duration-200 ${activeSessionId === session.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-slate-700/50'}`}>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate pr-6">{session.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(session.createdAt).toLocaleDateString('tr-TR')}</p>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ onNewChat: () => void }> = ({ onNewChat }) => (
    <div className="relative flex flex-col items-center justify-center h-full text-center text-gray-400 z-10 p-4">
        <div className="absolute inset-0 bg-black/5 dark:bg-black/20"></div>
        <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 opacity-30 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">MrAgenda AI</h2>
            <p className="max-w-xs mx-auto text-gray-600 dark:text-gray-400">Yeni bir sohbete başlayın veya kenar çubuğundan mevcut bir sohbeti seçin.</p>
            <button onClick={onNewChat} className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-105">
                Yeni Sohbet Başlat
            </button>
        </div>
    </div>
);

const DeleteChatConfirmModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
    const [isChecked, setIsChecked] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setIsAnimating(true));
    }, []);

    const handleConfirm = () => {
        setIsAnimating(false);
        setTimeout(onConfirm, 300);
    };
    const handleCancel = () => {
        setIsAnimating(false);
        setTimeout(onCancel, 300);
    };

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-black bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Sohbeti Sil</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Bu sohbeti kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 mb-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        className="h-4 w-4 rounded text-red-500 focus:ring-red-400 border-gray-300 dark:border-gray-600"
                    />
                    <span>Evet, silmek istediğimi onaylıyorum.</span>
                </label>
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCancel} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">İptal</button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!isChecked}
                        className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
                    >
                        Sil
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Ana Bileşen ---

const AiChat: React.FC = () => {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { chatSessions, saveChatSession, deleteChatSession } = useAppContext();
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);


    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    useEffect(() => {
        if (!isMobileView) {
            if (!activeSessionId && chatSessions.length > 0) {
                setActiveSessionId(chatSessions[0].id);
            }
        } else {
            setIsSidebarOpen(false);
        }
    }, [isMobileView, chatSessions, activeSessionId]);

    const activeSession = useMemo(() => {
        return chatSessions.find(s => s.id === activeSessionId) || null;
    }, [activeSessionId, chatSessions]);


    const handleNewChat = () => {
        const newSession: ChatSession = {
            id: `chat_new_${Date.now()}`,
            title: 'Yeni Sohbet',
            messages: [],
            createdAt: new Date().toISOString(),
        };
        saveChatSession(newSession); 
        setActiveSessionId(newSession.id);
        if (isMobileView) {
            setIsSidebarOpen(false);
        }
    };

    const handleDeleteChat = (sessionId: string) => {
        setSessionToDelete(sessionId);
    };
    
    const handleConfirmDelete = () => {
        if (!sessionToDelete) return;

        if (activeSessionId === sessionToDelete) {
             const currentIndex = chatSessions.findIndex(s => s.id === sessionToDelete);
             const nextSession = chatSessions[currentIndex - 1] || chatSessions[currentIndex + 1];
             setActiveSessionId(nextSession ? nextSession.id : null);
        }
        deleteChatSession(sessionToDelete);
        setSessionToDelete(null);
    };


    const handleSendMessage = async (userInput: string, sessionToUpdate: ChatSession) => {
        setIsLoading(true);
    
        if (!sessionToUpdate) {
            setIsLoading(false);
            return;
        }
        
        const userMessage: ChatMessage = { text: userInput, isUser: true };
        const isNewChat = sessionToUpdate.messages.length === 0;
        const newTitle = userInput.substring(0, 40) + (userInput.length > 40 ? '...' : '');
        const finalSessionId = isNewChat ? `chat_${Date.now()}` : sessionToUpdate.id;
    
        let updatedSession: ChatSession = {
            ...sessionToUpdate,
            id: finalSessionId,
            title: isNewChat ? newTitle : sessionToUpdate.title,
            messages: [...sessionToUpdate.messages, userMessage],
        };
    
        if (isNewChat && sessionToUpdate.id.startsWith('chat_new_')) {
             deleteChatSession(sessionToUpdate.id);
        }
        
        const aiPlaceholder: ChatMessage = { text: '', isUser: false };
        updatedSession.messages.push(aiPlaceholder);
    
        let currentSessionForStream = updatedSession;
        saveChatSession(currentSessionForStream);
        setActiveSessionId(finalSessionId);
    
        try {
            const history = currentSessionForStream.messages.slice(0, -1);
            const stream = await generatePlanStream(history);
            let aiResponseText = '';
    
            for await (const chunk of stream) {
                aiResponseText += chunk.text;
                const newMessages = [...currentSessionForStream.messages];
                newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], text: aiResponseText };
                
                currentSessionForStream = { ...currentSessionForStream, messages: newMessages };
                saveChatSession(currentSessionForStream);
            }
        } catch (error) {
            console.error("Yayın başarısız:", error);
            const errorMessage = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.";
            const newMessages = [...currentSessionForStream.messages];
            if (newMessages.length > 0 && !newMessages[newMessages.length - 1].isUser) {
                newMessages[newMessages.length - 1] = { text: errorMessage, isUser: false };
                saveChatSession({ ...currentSessionForStream, messages: newMessages });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const showChatListOnMobile = isMobileView && !activeSessionId;

    return (
        <div className="flex h-[calc(100vh-5rem)] text-gray-800 dark:text-white bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="animated-grid-background absolute inset-0 z-0" />

            {showChatListOnMobile ? (
                 <div className="w-full h-full z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
                    <ChatList
                        sessions={chatSessions}
                        activeSessionId={activeSessionId}
                        onSelect={(id) => setActiveSessionId(id)}
                        onNew={handleNewChat}
                        onDelete={handleDeleteChat}
                    />
                </div>
            ) : (
                <>
                    {/* --- Masaüstü Kenar Çubuğu --- */}
                    {!isMobileView && (
                         <aside className={`absolute top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <div className="w-80 h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-r border-gray-200 dark:border-slate-700">
                                 <ChatList
                                    sessions={chatSessions}
                                    activeSessionId={activeSessionId}
                                    onSelect={(id) => {
                                        setActiveSessionId(id);
                                        if (isMobileView) setIsSidebarOpen(false);
                                    }}
                                    onNew={handleNewChat}
                                    onDelete={handleDeleteChat}
                                />
                            </div>
                        </aside>
                    )}
                    
                    {/* --- Ana Sohbet Alanı --- */}
                    <div className={`relative flex-grow h-full min-w-0 transition-all duration-300 ease-in-out ${!isMobileView && isSidebarOpen ? 'ml-80' : ''}`}>
                        {/* --- Dim Overlay for Sidebar --- */}
                        {!isMobileView && isSidebarOpen && (
                            <div onClick={() => setIsSidebarOpen(false)} className="absolute inset-0 bg-black/30 z-20" />
                        )}

                        {activeSession ? (
                            <ChatView
                                session={activeSession}
                                onBack={() => setActiveSessionId(null)}
                                onSendMessage={handleSendMessage}
                                isLoading={isLoading}
                                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                                isMobile={isMobileView}
                            />
                        ) : (
                            <div className="relative flex flex-col h-full">
                                {!isMobileView && (
                                    <header className="absolute top-0 left-0 right-0 z-30 flex items-center p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
                                        <button onClick={() => setIsSidebarOpen(p => !p)} className="p-2 mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                            <MenuIcon />
                                        </button>
                                        <h1 className="text-lg font-semibold">MrAgenda AI</h1>
                                    </header>
                                )}
                                <EmptyState onNewChat={handleNewChat} />
                            </div>
                        )}
                    </div>
                </>
            )}
            {sessionToDelete && (
                <DeleteChatConfirmModal
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setSessionToDelete(null)}
                />
            )}
            <style>{`
                @keyframes background-pan {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 100% 100%; }
                }
                .animated-grid-background {
                    background-color: #ffffff;
                    background-image:
                        radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 40%),
                        linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
                    background-size: 100% 100%, 2rem 2rem, 2rem 2rem;
                    animation: background-pan 45s linear infinite;
                }
                .dark .animated-grid-background {
                    background-color: #020617; 
                    background-image:
                        radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0) 40%),
                        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                textarea::-webkit-scrollbar {
                    width: 6px;
                }
                textarea::-webkit-scrollbar-thumb {
                    background-color: #4b5563;
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
};

export default AiChat;