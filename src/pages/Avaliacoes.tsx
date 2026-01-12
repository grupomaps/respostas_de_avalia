import { useState, useEffect } from 'react';
import { supabase, Avaliacao, Empresa } from '../lib/supabase';
import { Star, CheckCircle, XCircle, MessageSquare, AlertCircle, Sparkles, Send, Edit3, X } from 'lucide-react';

export function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<(Avaliacao & { empresa?: Empresa })[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [respondendoId, setRespondendoId] = useState<string | null>(null);
  const [gerandoResposta, setGerandoResposta] = useState(false);
  const [respostaPreview, setRespostaPreview] = useState('');
  const [editandoResposta, setEditandoResposta] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [avaliacoesData, empresasData] = await Promise.all([
        supabase
          .from('avaliacoes')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('empresas')
          .select('*')
          .order('nome'),
      ]);

      if (avaliacoesData.error) throw avaliacoesData.error;
      if (empresasData.error) throw empresasData.error;

      const empresasMap = new Map(empresasData.data?.map(e => [e.id, e]) || []);
      const avaliacoesWithEmpresa = (avaliacoesData.data || []).map(av => ({
        ...av,
        empresa: empresasMap.get(av.empresa_id),
      }));

      setAvaliacoes(avaliacoesWithEmpresa);
      setEmpresas(empresasData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const gerarRespostaIA = async (avaliacao: Avaliacao & { empresa?: Empresa }) => {
    if (!avaliacao.empresa?.automacao_ativa) {
      showMessage('error', 'Automação desativada para esta empresa');
      return;
    }

    setRespondendoId(avaliacao.id);
    setGerandoResposta(true);
    setEditandoResposta(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          rating: avaliacao.rating,
          comentario: avaliacao.comentario,
          empresa_id: avaliacao.empresa_id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar resposta');
      }

      const data = await response.json();
      setRespostaPreview(data.response);
      showMessage('success', 'Resposta gerada com sucesso!');
    } catch (error: any) {
      console.error('Error generating response:', error);
      showMessage('error', error.message || 'Erro ao gerar resposta');
      setRespondendoId(null);
    } finally {
      setGerandoResposta(false);
    }
  };

  const publicarResposta = async (avaliacaoId: string) => {
    if (!respostaPreview.trim()) {
      showMessage('error', 'A resposta não pode estar vazia');
      return;
    }

    try {
      const { error } = await supabase
        .from('avaliacoes')
        .update({
          respondida: true,
          resposta: respostaPreview,
        })
        .eq('id', avaliacaoId);

      if (error) throw error;

      await supabase.from('logs').insert({
        tipo: 'info',
        mensagem: `Resposta publicada para avaliação ${avaliacaoId}`,
      });

      showMessage('success', 'Resposta publicada com sucesso!');
      setRespondendoId(null);
      setRespostaPreview('');
      loadData();
    } catch (error: any) {
      console.error('Error publishing response:', error);
      showMessage('error', error.message || 'Erro ao publicar resposta');
    }
  };

  const cancelarResposta = () => {
    setRespondendoId(null);
    setRespostaPreview('');
    setEditandoResposta(false);
  };

  const filteredAvaliacoes = avaliacoes.filter(av => {
    const matchEmpresa = selectedEmpresa === 'all' || av.empresa_id === selectedEmpresa;
    const matchStatus = selectedStatus === 'all' ||
      (selectedStatus === 'respondida' && av.respondida) ||
      (selectedStatus === 'pendente' && !av.respondida);
    return matchEmpresa && matchStatus;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`} />
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filtrar por Empresa
          </label>
          <select
            value={selectedEmpresa}
            onChange={(e) => setSelectedEmpresa(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todas as Empresas</option>
            {empresas.map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filtrar por Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="respondida">Respondidas</option>
            <option value="pendente">Pendentes</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Avaliações ({filteredAvaliacoes.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-200">
          {filteredAvaliacoes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhuma avaliação encontrada
            </div>
          ) : (
            filteredAvaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{avaliacao.autor}</h3>
                      {renderStars(avaliacao.rating)}
                    </div>
                    {avaliacao.empresa && (
                      <p className="text-sm text-slate-500">
                        Empresa: {avaliacao.empresa.nome}
                      </p>
                    )}
                    <p className="text-sm text-slate-400">
                      {new Date(avaliacao.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    {avaliacao.respondida ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Respondida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        <XCircle className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                  </div>
                </div>

                {avaliacao.comentario && (
                  <div className="mb-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700">{avaliacao.comentario}</p>
                  </div>
                )}

                {avaliacao.resposta && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Resposta:</span>
                    </div>
                    <p className="text-sm text-blue-800">{avaliacao.resposta}</p>
                  </div>
                )}

                {!avaliacao.respondida && respondendoId !== avaliacao.id && (
                  <div className="mt-3">
                    <button
                      onClick={() => gerarRespostaIA(avaliacao)}
                      disabled={!avaliacao.empresa?.automacao_ativa}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                        avaliacao.empresa?.automacao_ativa
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Responder com IA
                    </button>
                    {!avaliacao.empresa?.automacao_ativa && (
                      <p className="mt-2 text-xs text-red-600">
                        Automação desativada para esta empresa
                      </p>
                    )}
                  </div>
                )}

                {respondendoId === avaliacao.id && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-blue-300">
                    {gerandoResposta ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-slate-600">Gerando resposta com IA...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-slate-900">
                            Preview da Resposta
                          </label>
                          <button
                            onClick={() => setEditandoResposta(!editandoResposta)}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <Edit3 className="w-4 h-4" />
                            {editandoResposta ? 'Salvar' : 'Editar'}
                          </button>
                        </div>

                        {editandoResposta ? (
                          <textarea
                            value={respostaPreview}
                            onChange={(e) => setRespostaPreview(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            rows={4}
                          />
                        ) : (
                          <div className="p-3 bg-white rounded border border-slate-200">
                            <p className="text-sm text-slate-700">{respostaPreview}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => publicarResposta(avaliacao.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                          >
                            <Send className="w-4 h-4" />
                            Publicar Resposta
                          </button>
                          <button
                            onClick={cancelarResposta}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
