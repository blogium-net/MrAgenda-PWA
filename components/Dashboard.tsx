import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Note } from '../types';
import { NoteCategory } from '../types';
import { useAppContext } from '../App';

// Header Component
const Header: React.FC = () => {
    const { user } = useAppContext();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        weekday: 'long',
    }).format(time);

    const formattedTime = new Intl.DateTimeFormat('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(time);

    return (
        <header className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Hoşgeldiniz, {user?.name}</h1>
            <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                <div>{formattedDate}</div>
                <div>{formattedTime}</div>
            </div>
        </header>
    );
};

// NoteCard Component
const NoteCard: React.FC<{ note: Note; onClick: () => void }> = ({ note, onClick }) => {
    const createPreview = (html: string) => {
        if (!html) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const text = (tempDiv.textContent || tempDiv.innerText || '').trim().replace(/\s+/g, ' ');
        return text.length > 100 ? `${text.substring(0, 100)}...` : text;
    };
    
    const contentPreview = createPreview(note.content);
    
    return (
        <div onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">{note.title}</h3>
                <div className="flex space-x-2">
                    {note.isImportant && <span title="Önemli" className="text-yellow-500">★</span>}
                </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{contentPreview}</p>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                {new Date(note.updatedAt).toLocaleDateString('tr-TR')}
            </div>
        </div>
    );
};

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);


// PinModal Component
const PinModal: React.FC<{ onConfirm: (pin: string) => boolean; onCancel: () => void }> = ({ onConfirm, onCancel }) => {
    const [pin, setPin] = useState<string[]>(['', '', '', '']);
    const [error, setError] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            setIsAnimating(true);
            inputRefs.current[0]?.focus();
        });
    }, []);

    const handleClose = (callback: () => void) => {
        setIsAnimating(false);
        setTimeout(callback, 300); // Wait for animation to finish
    };

    const attemptConfirm = (pinValue: string) => {
        if (onConfirm(pinValue)) {
            // onConfirm returns true, now we can close.
            // The onCancel prop is the one that sets parent state to close.
            handleClose(onCancel);
        } else {
            setError(true);
            setTimeout(() => {
                setPin(['', '', '', '']);
                inputRefs.current[0]?.focus();
            }, 820);
        }
    };

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        setError(false);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newPin.every(digit => digit !== '')) {
            attemptConfirm(newPin.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pastedData.length === 4) {
            const newPin = pastedData.split('');
            setPin(newPin);
            attemptConfirm(pastedData);
        }
    };


    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-black bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm text-center relative transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button onClick={() => handleClose(onCancel)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <LockIcon />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">PIN Gerekli</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6">Gizli notları görüntülemek için 4 haneli PIN kodunuzu girin.</p>
                
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {pin.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => { inputRefs.current[index] = el; }}
                            type="password"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className={`w-14 h-16 text-center text-3xl font-bold bg-gray-100 dark:bg-gray-700 border-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 ${error ? 'border-red-500 animate-shake' : 'border-gray-200 dark:border-gray-600'}`}
                            style={{ caretColor: 'transparent' }}
                        />
                    ))}
                </div>
                {error && <p className="text-red-500 text-sm mt-4">Yanlış PIN. Lütfen tekrar deneyin.</p>}
            </div>
            <style>{`
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                .animate-shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both; }
            `}</style>
        </div>
    );
};


// Dashboard Component
const Dashboard: React.FC<{ onEditNote: (note: Note) => void }> = ({ onEditNote }) => {
    const { notes, user } = useAppContext();
    const [activeCategory, setActiveCategory] = useState<NoteCategory>(NoteCategory.All);
    const [showPinModal, setShowPinModal] = useState(false);
    const [unlockedSecretNotes, setUnlockedSecretNotes] = useState(false);

    const handleCategoryClick = (category: NoteCategory) => {
        if (category === NoteCategory.Secret && !unlockedSecretNotes) {
            setShowPinModal(true);
        } else {
            setActiveCategory(category);
            if (category !== NoteCategory.Secret) {
                setUnlockedSecretNotes(false);
            }
        }
    };
    
    const handlePinConfirm = (pin: string): boolean => {
        if (pin === user?.pin) {
            setUnlockedSecretNotes(true);
            setActiveCategory(NoteCategory.Secret);
            // The modal will close itself after success animation
            return true;
        } else {
            return false;
        }
    };

    const filteredNotes = useMemo(() => {
        const sortedNotes = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        switch (activeCategory) {
            case NoteCategory.Important:
                return sortedNotes.filter(n => n.isImportant && !n.isSecret);
            case NoteCategory.Upcoming:
                return sortedNotes.filter(n => n.reminder && new Date(n.reminder) > new Date() && !n.isSecret);
            case NoteCategory.Secret:
                return unlockedSecretNotes ? sortedNotes.filter(n => n.isSecret) : [];
            case NoteCategory.All:
            default:
                return sortedNotes.filter(n => !n.isSecret);
        }
    }, [notes, activeCategory, unlockedSecretNotes]);
    
    const categories = Object.values(NoteCategory);

    return (
        <div className="container mx-auto px-4">
            <Header />

            <div className="my-4 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors duration-200 ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map(note => (
                        <NoteCard key={note.id} note={note} onClick={() => onEditNote(note)} />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                        <p>Bu kategoride not bulunmuyor.</p>
                    </div>
                )}
            </div>
            {showPinModal && <PinModal onConfirm={handlePinConfirm} onCancel={() => setShowPinModal(false)} />}
        </div>
    );
};

export default Dashboard;