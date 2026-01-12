import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Star, CheckCircle, XCircle } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalEmpresas: 0,
    empresasConectadas: 0,
    totalAvaliacoes: 0,
    avaliacoesRespondidas: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [empresasData, avaliacoesData] = await Promise.all([
        supabase.from('empresas').select('id, google_conectado'),
        supabase.from('avaliacoes').select('id, respondida'),
      ]);

      const empresas = empresasData.data || [];
      const avaliacoes = avaliacoesData.data || [];

      setStats({
        totalEmpresas: empresas.length,
        empresasConectadas: empresas.filter(e => e.google_conectado).length,
        totalAvaliacoes: avaliacoes.length,
        avaliacoesRespondidas: avaliacoes.filter(a => a.respondida).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total de Empresas',
      value: stats.totalEmpresas,
      icon: Building2,
      color: 'bg-blue-600',
    },
    {
      title: 'Empresas Conectadas',
      value: stats.empresasConectadas,
      icon: CheckCircle,
      color: 'bg-green-600',
    },
    {
      title: 'Total de Avaliações',
      value: stats.totalAvaliacoes,
      icon: Star,
      color: 'bg-yellow-600',
    },
    {
      title: 'Avaliações Respondidas',
      value: stats.avaliacoesRespondidas,
      icon: CheckCircle,
      color: 'bg-emerald-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-slate-600 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Bem-vindo ao GMAPS</h3>
        <p className="text-slate-600 mb-4">
          Sistema de gerenciamento de respostas automáticas para avaliações do Google Maps usando
          Inteligência Artificial.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Funcionalidades</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Gerenciamento de empresas</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Respostas automáticas com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Integração com Google Maps</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Sistema de logs completo</span>
              </li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Configuração</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Configure as chaves de API</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Conecte empresas ao Google Maps</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Ative a automação de respostas</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
