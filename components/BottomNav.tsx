
import React from 'react';
import { useAppContext } from '../App';
import type { View } from '../types';

// Icon Components
const HomeIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const PlusIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const MrAgendaIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 64 64" fill="currentColor">
        <path d="M14 46V18H22L32 34L42 18H50V46H44V26L34 42H30L20 26V46H14Z" />
    </svg>
);

const ClockIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SettingsIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const BottomNav: React.FC = () => {
    const { view, setView } = useAppContext();

    const NavButton = ({ icon, label, targetView, isActive }: { icon: React.ReactNode, label: string, targetView: View, isActive: boolean }) => (
        <button 
            onClick={() => setView(targetView)} 
            className={`relative flex flex-col items-center justify-center w-16 h-16 text-center transition-all duration-200 ease-in-out transform active:scale-90 focus:outline-none ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400'}`}
        >
            {icon}
            <span className={`text-xs mt-1 transition-all duration-200 ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </button>
    );

    const isChatActive = view === 'chat';

    return (
        <>
            <nav className="fixed bottom-4 left-0 right-0 h-16 z-50 flex justify-center items-center pointer-events-none">
                <div className="relative flex justify-around items-center h-full w-full max-w-sm mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full shadow-lg pointer-events-auto">
                    <NavButton icon={<HomeIcon className="w-6 h-6" />} label="Anasayfa" targetView="dashboard" isActive={view === 'dashboard'} />
                    <NavButton icon={<PlusIcon className="w-6 h-6" />} label="Not Ekle" targetView="editor" isActive={view === 'editor'} />
                    
                    {/* Placeholder for the central button */}
                    <div className="w-16 h-16" />

                    <NavButton icon={<ClockIcon className="w-6 h-6" />} label="Saat" targetView="clock" isActive={view === 'clock'} />
                    <NavButton icon={<SettingsIcon className="w-6 h-6" />} label="Ayarlar" targetView="settings" isActive={view === 'settings'} />

                    {/* Central AI Button */}
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3">
                         <button onClick={() => setView('chat')} className="relative group flex flex-col items-center transform transition-transform duration-300 ease-in-out hover:-translate-y-1 active:scale-95" aria-label="MrAgenda AI">
                            <div className={`absolute -inset-1.5 rounded-full transition-opacity duration-300 ease-in-out ${isChatActive ? 'animate-pulse-glow opacity-100' : 'opacity-0'}`}></div>
                            <div className="relative flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white shadow-lg transition-colors duration-200 group-hover:bg-blue-700">
                                <MrAgendaIcon className="w-8 h-8"/>
                            </div>
                            <span className={`text-xs mt-2 transition-colors duration-200 ${isChatActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-400 font-medium'}`}>MrAgenda</span>
                        </button>
                    </div>
                </div>
            </nav>
            <style>{`
                @keyframes pulse-glow {
                    0%, 100% {
                        box-shadow: 0 0 12px 2px rgba(59, 130, 246, 0.4);
                    }
                    50% {
                        box-shadow: 0 0 20px 5px rgba(59, 130, 246, 0.6);
                    }
                }
                .animate-pulse-glow {
                    animation: pulse-glow 2.5s infinite ease-in-out;
                }
            `}</style>
        </>
    );
};

export default BottomNav;