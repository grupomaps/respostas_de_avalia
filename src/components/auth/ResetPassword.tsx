import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, Mail, AlertCircle, CheckCircle } from 'lucide-react';

interface ResetPasswordProps {
  onToggleView: (view: 'login' | 'signup' | 'reset') => void;
}

export function ResetPassword({ onToggleView }: ResetPasswordProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-xl mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Email enviado!
          </h2>
          <p className="text-slate-600 mb-6">
            Verifique seu email para redefinir sua senha.
          </p>
          <button
            onClick={() => onToggleView('login')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img
            src="/chatgpt_image_10_de_jan._de_2026,_23_15_19.png"
            alt="GMAPS Logo"
            className="w-32 h-32 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold text-slate-900">Recuperar Senha</h1>
          <p className="text-slate-600 mt-2">
            Digite seu email para receber um link de recuperação
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-6">
          Lembrou sua senha?{' '}
          <button
            onClick={() => onToggleView('login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  );
}
