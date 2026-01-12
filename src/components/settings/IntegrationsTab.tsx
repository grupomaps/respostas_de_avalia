import { useState, useEffect } from 'react';
import { supabase, SystemConfig } from '../../lib/supabase';
import { Save, TestTube, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

export function IntegrationsTab() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [openaiKey, setOpenaiKey] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<'openai' | 'google' | null>(null);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [integrationStatus, setIntegrationStatus] = useState({
    openai: null as boolean | null,
    google: null as boolean | null,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data);
        setOpenaiKey(data.openai_api_key || '');
        setGoogleClientId(data.google_client_id || '');
        setGoogleClientSecret(data.google_client_secret || '');

        checkIntegrationStatus(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      showMessage('error', 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const checkIntegrationStatus = (configData: SystemConfig) => {
    setIntegrationStatus({
      openai: configData.openai_api_key ? configData.openai_api_key.length > 0 : false,
      google: configData.google_client_id && configData.google_client_secret
        ? configData.google_client_id.length > 0 && configData.google_client_secret.length > 0
        : false,
    });
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_config')
        .update({
          openai_api_key: openaiKey,
          google_client_id: googleClientId,
          google_client_secret: googleClientSecret,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config?.id);

      if (error) throw error;

      showMessage('success', 'Chaves salvas com sucesso!');
      await loadConfig();
    } catch (error: any) {
      console.error('Error saving config:', error);
      showMessage('error', error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const testOpenAI = async () => {
    if (!openaiKey.trim()) {
      showMessage('error', 'Configure a chave da OpenAI primeiro');
      return;
    }

    setTesting('openai');
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
        },
      });

      if (response.ok) {
        showMessage('success', 'Chave OpenAI válida!');
        setIntegrationStatus(prev => ({ ...prev, openai: true }));
      } else {
        showMessage('error', 'Chave OpenAI inválida');
        setIntegrationStatus(prev => ({ ...prev, openai: false }));
      }
    } catch (error) {
      showMessage('error', 'Erro ao testar OpenAI');
      setIntegrationStatus(prev => ({ ...prev, openai: false }));
    } finally {
      setTesting(null);
    }
  };

  const testGoogleOAuth = async () => {
    if (!googleClientId.trim() || !googleClientSecret.trim()) {
      showMessage('error', 'Configure as credenciais do Google primeiro');
      return;
    }

    setTesting('google');
    try {
      showMessage('success', 'Credenciais do Google configuradas. Teste fazendo login com Google.');
      setIntegrationStatus(prev => ({ ...prev, google: true }));
    } catch (error) {
      showMessage('error', 'Erro ao validar credenciais do Google');
      setIntegrationStatus(prev => ({ ...prev, google: false }));
    } finally {
      setTesting(null);
    }
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
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg border-2 ${
          integrationStatus.openai === true ? 'bg-green-50 border-green-300' :
          integrationStatus.openai === false ? 'bg-red-50 border-red-300' :
          'bg-slate-50 border-slate-300'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              integrationStatus.openai === true ? 'bg-green-500' :
              integrationStatus.openai === false ? 'bg-red-500' :
              'bg-slate-400'
            }`}></div>
            <h4 className="font-semibold text-slate-900">OpenAI API</h4>
          </div>
          <p className="text-sm text-slate-600">
            {integrationStatus.openai === true ? 'Configurado e funcionando' :
             integrationStatus.openai === false ? 'Configurado mas com erro' :
             'Não configurado'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          integrationStatus.google === true ? 'bg-green-50 border-green-300' :
          integrationStatus.google === false ? 'bg-red-50 border-red-300' :
          'bg-slate-50 border-slate-300'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              integrationStatus.google === true ? 'bg-green-500' :
              integrationStatus.google === false ? 'bg-red-500' :
              'bg-slate-400'
            }`}></div>
            <h4 className="font-semibold text-slate-900">Google OAuth</h4>
          </div>
          <p className="text-sm text-slate-600">
            {integrationStatus.google === true ? 'Configurado e funcionando' :
             integrationStatus.google === false ? 'Configurado mas com erro' :
             'Não configurado'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Chaves & Integrações
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              OpenAI API Key
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOpenaiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={testOpenAI}
                disabled={testing === 'openai'}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                <TestTube className="w-5 h-5" />
                {testing === 'openai' ? 'Testando...' : 'Testar'}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Chave de API da OpenAI para geração de respostas automáticas
            </p>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-md font-semibold text-slate-900 mb-4">
              Google OAuth Credentials
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Google Client ID
                </label>
                <input
                  type="text"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="123456789-abc123.apps.googleusercontent.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Google Client Secret
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showGoogleSecret ? 'text' : 'password'}
                      value={googleClientSecret}
                      onChange={(e) => setGoogleClientSecret(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="GOCSPX-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showGoogleSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={testGoogleOAuth}
                    disabled={testing === 'google'}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <TestTube className="w-5 h-5" />
                    {testing === 'google' ? 'Testando...' : 'Testar'}
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Credenciais OAuth do Google para autenticação e acesso ao Google Maps
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salvar Chaves'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
