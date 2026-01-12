import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallback() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      window.location.href = '/';
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Autenticando...</h2>
        <p className="text-slate-600">Aguarde enquanto completamos seu login.</p>
      </div>
    </div>
  );
}
