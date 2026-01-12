import { useState, useEffect } from 'react';
import { supabase, Log } from '../lib/supabase';
import { AlertCircle, Info, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTipo, setFilterTipo] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getLogBgColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const filteredLogs = filterTipo === 'all'
    ? logs
    : logs.filter(log => log.tipo.toLowerCase() === filterTipo.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filtrar por Tipo
          </label>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos os Tipos</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          <RefreshCw className="w-5 h-5" />
          Atualizar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Logs do Sistema ({filteredLogs.length})
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhum log encontrado
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-4 rounded-lg border ${getLogBgColor(log.tipo)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-900 uppercase">
                        {log.tipo}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(log.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 break-words">
                      {log.mensagem}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
