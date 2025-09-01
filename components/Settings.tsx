import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { Theme } from '../types';

// --- Icon Components ---

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

const AlertTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const DesktopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

// --- Confirmation Modal for Deleting Data ---
const DeleteAllDataConfirmModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => {
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
        <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out ${isAnimating ? 'bg-black bg-opacity-60 backdrop-blur-sm' : 'bg-opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm transition-all duration-300 ease-out ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Tüm Verileri Sil</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Bu işlem tüm notlarınızı, sohbetlerinizi ve ayarlarınızı kalıcı olarak silecektir. Bu işlem geri alınamaz.
                </p>
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 mb-4 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                        className="h-4 w-4 rounded text-red-500 focus:ring-red-400 border-gray-300 dark:border-gray-600"
                    />
                    <span>Her şeyi silmek istediğimi anlıyorum ve onaylıyorum.</span>
                </label>
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCancel} className="px-4 py-2 rounded text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">İptal</button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!isChecked}
                        className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Evet, Sil
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Settings Component ---

const Settings: React.FC = () => {
    const { user, settings, saveUser, saveSettings } = useAppContext();
    const [name, setName] = useState(user?.name || '');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleUserUpdate = () => {
        if (!user) return;
        let newPin = user.pin;
        if (pin) {
            if (pin.length !== 4 || pin !== confirmPin) {
                alert("PIN'ler eşleşmiyor veya 4 haneli değil.");
                return;
            }
            newPin = pin;
        }
         if (name.trim().length < 2) {
            alert("İsim en az 2 karakter olmalıdır.");
            return;
        }
        saveUser({ name: name.trim() || user.name, pin: newPin });
        alert("Bilgiler güncellendi.");
        setPin('');
        setConfirmPin('');
    };
    
    const handleThemeChange = (theme: Theme) => {
        saveSettings({ ...settings, theme });
    };

    const handleDeleteAllData = () => {
        localStorage.clear();
        window.location.reload();
    };
    
    const ThemeOption: React.FC<{
        icon: React.ReactNode;
        label: string;
        onClick: () => void;
        isSelected: boolean;
    }> = ({ icon, label, onClick, isSelected }) => (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 space-y-2 border-2 rounded-lg transition-all duration-200 ${
                isSelected 
                ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
        >
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-200">Ayarlar</h1>

            <div className="space-y-10">
                {/* User Settings */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-4 mb-6">
                        <UserIcon />
                        <h2 className="text-xl font-semibold">Kullanıcı Bilgileri</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">İsim</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yeni 4-Haneli PIN (değiştirmek için)</label>
                            <input type="password" id="pin" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={4} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="••••" />
                        </div>
                        <div>
                            <label htmlFor="confirmPin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yeni PIN'i Onayla</label>
                            <input type="password" id="confirmPin" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} maxLength={4} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="••••" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleUserUpdate} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors">Değişiklikleri Kaydet</button>
                    </div>
                </section>

                {/* Theme Settings */}
                <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-4 mb-6">
                        <PaletteIcon />
                        <h2 className="text-xl font-semibold">Görünüm</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <ThemeOption icon={<SunIcon />} label="Açık" onClick={() => handleThemeChange(Theme.Light)} isSelected={settings.theme === Theme.Light} />
                        <ThemeOption icon={<MoonIcon />} label="Koyu" onClick={() => handleThemeChange(Theme.Dark)} isSelected={settings.theme === Theme.Dark} />
                        <ThemeOption icon={<DesktopIcon />} label="Sistem" onClick={() => handleThemeChange(Theme.System)} isSelected={settings.theme === Theme.System} />
                    </div>
                </section>
                
                {/* Danger Zone */}
                <section className="border-2 border-red-300 dark:border-red-700/50 p-6 rounded-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <AlertTriangleIcon />
                        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Tehlikeli Alan</h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Bu eylem geri alınamaz. Lütfen devam etmeden önce dikkatli olun.
                    </p>
                    <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">Tüm Verileri Sil</button>
                </section>
            </div>
            {showDeleteConfirm && (
                <DeleteAllDataConfirmModal
                    onConfirm={() => {
                        setShowDeleteConfirm(false);
                        handleDeleteAllData();
                    }}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    );
};
// FIX: Add default export to fix import error in App.tsx and the component definition error.
export default Settings;