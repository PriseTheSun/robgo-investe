'use client';

import { useState, useEffect } from 'react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('robgo_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('robgo_cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed z-[999] inset-x-0 bottom-4 flex justify-center pointer-events-none px-4">
      <div className="relative z-10 w-full max-w-sm bg-gray-900 dark:bg-gray-800 text-white shadow-2xl px-6 py-4 rounded-full border border-gray-800 dark:border-white/10 transform transition-all pointer-events-auto flex items-center justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
        <p className="text-[11px] font-medium text-gray-300 leading-tight">
          Nós usamos cookies essenciais.
        </p>
        <button 
          onClick={acceptCookies}
          className="flex-shrink-0 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-[10px] font-bold transition-all active:scale-95"
        >
          OK
        </button>
      </div>
    </div>
  );
}
