import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';

// SVG Icons for Toolbar and Menu
const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const BoldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
    </svg>
);

const ItalicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="4" x2="10" y2="4"></line>
        <line x1="14" y1="20" x2="5" y2="20"></line>
        <line x1="15" y1="4" x2="9" y2="20"></line>
    </svg>
);

const UnderlineIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
        <line x1="4" y1="21" x2="20" y2="21"></line>
    </svg>
);

const MinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const CheckboxIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
);

const ReminderModal: React.FC<{
    initialDateTime: string | undefined;
    onSave: (dateTime: string) => void;
    onClear: () => void;
    onCancel: () => void;
}> = ({ initialDateTime, onSave, onClear, onCancel }) => {
    
    const toLocalISOString = (date: Date) => {
        const pad = (num: number) => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const [dateTime, setDateTime] = useState(() => {
        if (initialDateTime) return toLocalISOString(new Date(initialDateTime));
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return toLocalISOString(tomorrow);
    });
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setIsAnimating(true));
    }, []);

    const handleAction = (callback: () => void) => {
        setIsAnimating(false);
        setTimeout(callback, 300);
    };

    const handleSave = () => handleAction(() => onSave(dateTime));
    const handleClear = () => handleAction(onClear);
    const handleCancel = () => handleAction(onCancel);

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-black bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-lg font-semibold mb-4">Hatırlatıcı Ayarla</h3>
                <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex justify-between items-center mt-4">
                    <button onClick={handleClear} className="px-4 py-2 rounded text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">Temizle</button>
                    <div className="space-x-2">
                        <button onClick={handleCancel} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">İptal</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700">Kaydet</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DeleteConfirmModal: React.FC<{
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
        <div className={`fixed inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-black bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Notu Sil</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Bu notu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
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

const UnsavedChangesModal: React.FC<{
    onConfirm: () => void; // Discard changes
    onCancel: () => void;  // Keep editing
}> = ({ onConfirm, onCancel }) => {
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
        <div className={`fixed inset-0 flex items-center justify-center z-20 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-black bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-lg font-semibold mb-2">Kaydedilmemiş Değişiklikler</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Değişiklikleri kaydetmeden çıkmak istediğinizden emin misiniz? Yaptığınız değişiklikler kaybolacak.
                </p>
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCancel} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">İptal</button>
                    <button onClick={handleConfirm} className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700">Değişiklikleri Sil</button>
                </div>
            </div>
        </div>
    );
};


const NoteEditor: React.FC<{ note: Note | null; onSave: (note: Note) => void; onCancel: () => void; onDelete: (noteId: string) => void; }> = ({ note, onSave, onCancel, onDelete }) => {
    const [title, setTitle] = useState('');
    const [isImportant, setIsImportant] = useState(false);
    const [isSecret, setIsSecret] = useState(false);
    const [reminder, setReminder] = useState<string | undefined>(undefined);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);
    const [fontSize, setFontSize] = useState<number>(14);
    const initialNoteState = useRef<{ title: string; content: string; isImportant: boolean; isSecret: boolean; reminder: string | undefined } | null>(null);

    useEffect(() => {
        setTitle(note?.title || '');
        setIsImportant(note?.isImportant || false);
        setIsSecret(note?.isSecret || false);
        setReminder(note?.reminder);
        if (editorRef.current) {
            editorRef.current.innerHTML = note?.content || '';
        }

        // Store initial state for change detection
        initialNoteState.current = {
            title: note?.title || '',
            content: note?.content || '',
            isImportant: note?.isImportant || false,
            isSecret: note?.isSecret || false,
            reminder: note?.reminder,
        };
    }, [note]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const updateFontSizeFromSelection = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                let container = selection.getRangeAt(0).commonAncestorContainer;
                
                if (container.nodeType === 3) {
                    container = container.parentNode!;
                }
                
                if (container instanceof HTMLElement && editor.contains(container)) {
                     const computedStyle = window.getComputedStyle(container);
                     const size = parseInt(computedStyle.fontSize, 10);
                     setFontSize(isNaN(size) ? 16 : size);
                } else {
                     const editorStyle = window.getComputedStyle(editor);
                     const editorFontSize = parseInt(editorStyle.fontSize, 10);
                     setFontSize(isNaN(editorFontSize) ? 16 : editorFontSize);
                }
            }
        };

        document.addEventListener('selectionchange', updateFontSizeFromSelection);
        editor.addEventListener('click', updateFontSizeFromSelection);
        
        return () => {
            document.removeEventListener('selectionchange', updateFontSizeFromSelection);
            editor.removeEventListener('click', updateFontSizeFromSelection);
        };
    }, []);

    // Effect for handling checklist item clicks
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleChecklistClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.nodeName === 'LI' && target.parentElement?.classList.contains('checklist')) {
                const rect = target.getBoundingClientRect();
                // Check if the click was in the "checkbox zone" (e.g., first 28px)
                if (e.clientX >= rect.left && e.clientX <= rect.left + 28) {
                    target.classList.toggle('checked');
                    e.preventDefault(); // Prevent cursor from moving
                }
            }
        };

        editor.addEventListener('click', handleChecklistClick);
        return () => {
            editor.removeEventListener('click', handleChecklistClick);
        };
    }, []);

    const hasChanges = () => {
        if (!initialNoteState.current) {
            // For a new note, any content is a change
            return title.trim() !== '' || (editorRef.current?.innerHTML || '') !== '';
        }
        const content = editorRef.current?.innerHTML || '';
        return (
            title !== initialNoteState.current.title ||
            content !== initialNoteState.current.content ||
            isImportant !== initialNoteState.current.isImportant ||
            isSecret !== initialNoteState.current.isSecret ||
            reminder !== initialNoteState.current.reminder
        );
    };

    const handleCancel = () => {
        if (hasChanges()) {
            setShowUnsavedConfirm(true);
        } else {
            onCancel(); // No changes, just cancel
        }
    };

    const handleSave = () => {
        const now = new Date().toISOString();
        const finalTitle = title.trim() || `Not - ${new Date().toLocaleString('tr-TR')}`;
        const currentContent = editorRef.current?.innerHTML || '';

        const noteToSave: Note = {
            id: note?.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: finalTitle,
            content: currentContent,
            isImportant,
            isSecret,
            reminder,
            createdAt: note?.createdAt || now,
            updatedAt: now,
        };
        onSave(noteToSave);
    };

    const handleDelete = () => {
        if (note) {
            setShowDeleteConfirm(true);
        }
    };
    
    const handleConfirmDelete = () => {
        if (note) {
            onDelete(note.id);
            setShowDeleteConfirm(false);
        }
    };
    
    const execCmd = (cmd: string, value?: string) => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(cmd, false, value);
        }
    };
    
    const toggleChecklist = () => {
        if (!editorRef.current) return;
        editorRef.current.focus();

        document.execCommand('insertUnorderedList');

        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        let container = selection.getRangeAt(0).commonAncestorContainer;
        
        while (container && container !== editorRef.current) {
            if (container.nodeName === 'UL') {
                const ul = container as HTMLUListElement;
                if (!ul.classList.contains('checklist')) {
                    ul.classList.add('checklist');
                }
                break;
            }
            container = container.parentNode!;
        }
    };

    const changeFontSize = (increment: number) => {
        editorRef.current?.focus();
        const selection = window.getSelection();
    
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            return;
        }
    
        const range = selection.getRangeAt(0);
        
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode!;
        
        let currentSize = 16;
        if (container instanceof HTMLElement && editorRef.current?.contains(container)) {
            currentSize = parseInt(window.getComputedStyle(container).fontSize, 10);
        }
        const newSize = Math.max(8, (isNaN(currentSize) ? 16 : currentSize) + increment);

        const span = document.createElement('span');
        span.style.fontSize = `${newSize}px`;

        try {
            const selectedContents = range.extractContents();
            span.appendChild(selectedContents);
            range.insertNode(span);
    
            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            selection.addRange(newRange);
    
            setFontSize(newSize);
        } catch (e) {
            console.error("Failed to change font size. The selection might be too complex.", e);
        }
    };
    
    return (
        <div className="flex flex-col h-[calc(100vh-5rem)]">
            {/* Header */}
            <header className="flex items-center p-2 border-b dark:border-gray-700 shrink-0">
                <button onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <BackArrowIcon />
                </button>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Başlık..."
                    className="flex-grow text-xl font-semibold bg-transparent focus:outline-none p-2 mx-2"
                />
                <button onClick={handleSave} className="px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-200 bg-blue-600 text-white hover:bg-blue-700 mr-2">
                    Kaydet
                </button>
                <div className="relative">
                    <button onClick={() => setShowOptionsMenu(prev => !prev)} className="px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                        Daha fazla
                    </button>
                    {showOptionsMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10" onMouseLeave={() => setShowOptionsMenu(false)}>
                            <div className="py-1">
                                <label className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span>Önemli</span>
                                    <input type="checkbox" checked={isImportant} onChange={e => setIsImportant(e.target.checked)} className="h-4 w-4 rounded text-yellow-500 focus:ring-yellow-400"/>
                                </label>
                                 <label className="flex items-center justify-between px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span>Gizli</span>
                                    <input type="checkbox" checked={isSecret} onChange={e => setIsSecret(e.target.checked)} className="h-4 w-4 rounded text-red-500 focus:ring-red-400"/>
                                </label>
                                <div className="border-t my-1 dark:border-gray-600"></div>
                                <button onClick={() => {setShowReminderModal(true); setShowOptionsMenu(false);}} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Hatırlatıcı Ayarla</button>
                                {note && <div className="border-t my-1 dark:border-gray-600"></div>}
                                {note && <button onClick={handleDelete} className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">Sil</button>}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Reminder Info */}
            {reminder && (
                <div className="px-4 pt-2 text-xs text-center text-blue-600 dark:text-blue-400">
                    Hatırlatıcı: {new Date(reminder).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
            )}

            {/* Formatting Toolbar */}
            <div className="p-2 px-4 shrink-0 flex justify-center">
                 <div className="bg-white dark:bg-gray-800 rounded-full shadow-md p-1 inline-flex items-center space-x-1">
                    <button title="Kalın" onClick={() => execCmd('bold')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><BoldIcon /></button>
                    <button title="İtalik" onClick={() => execCmd('italic')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ItalicIcon /></button>
                    <button title="Altı Çizili" onClick={() => execCmd('underline')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><UnderlineIcon /></button>
                    <button title="Kontrol Listesi" onClick={toggleChecklist} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><CheckboxIcon /></button>
                     <div className="flex items-center space-x-1 border-l h-6 mx-1 dark:border-gray-600 pl-2">
                        <button title="Yazı Boyutunu Küçült" onClick={() => changeFontSize(-2)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <MinusIcon />
                        </button>
                        <span className="text-sm w-10 text-center font-mono select-none" aria-live="polite">{fontSize}px</span>
                        <button title="Yazı Boyutunu Büyüt" onClick={() => changeFontSize(2)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <PlusIcon />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable={true}
                data-placeholder="Metin girin..."
                className="flex-grow p-4 outline-none overflow-y-auto note-content-area"
            />
            
            {showReminderModal && (
                <ReminderModal 
                    initialDateTime={reminder}
                    onSave={(dateTime) => { setReminder(new Date(dateTime).toISOString()); setShowReminderModal(false); }}
                    onClear={() => { setReminder(undefined); setShowReminderModal(false); }}
                    onCancel={() => setShowReminderModal(false)}
                />
            )}

            {showDeleteConfirm && (
                <DeleteConfirmModal
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            {showUnsavedConfirm && (
                <UnsavedChangesModal
                    onConfirm={() => {
                        setShowUnsavedConfirm(false);
                        onCancel();
                    }}
                    onCancel={() => setShowUnsavedConfirm(false)}
                />
            )}
        </div>
    );
};

export default NoteEditor;