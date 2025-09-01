
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onSave: (data: { name: string; pin: string }) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('İsim en az 2 karakter olmalıdır.');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN 4 haneli bir sayı olmalıdır.');
      return;
    }
    setError('');
    onSave({ name: name.trim(), pin });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">MrAgenda'ya Hoş Geldiniz</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Başlamak için bilgilerinizi girin.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              İsminiz
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Adınızı girin"
            />
          </div>
          <div>
            <label htmlFor="pin" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gizli Notlar için 4 Haneli PIN
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              pattern="\d{4}"
              inputMode="numeric"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••"
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Kaydet ve Başla
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeScreen;
