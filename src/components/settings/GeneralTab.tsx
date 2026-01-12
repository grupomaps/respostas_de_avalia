import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface SystemSettings {
  id: string;
  system_name: string;
  logo_url: string;
  admin_email: string;
}

export function GeneralTab() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [systemName, setSystemName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setSystemName(data.system_name || '');
        setLogoUrl(data.logo_url || '');
        setAdminEmail(data.admin_email || '');
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          system_name: systemName,
          logo_url: logoUrl,
          admin_email: adminEmail,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings?.id);

      if (error) throw error;

      showMessage('success', 'Configurações salvas com sucesso!');
      await loadSettings();
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showMessage('error', error.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">
          Configurações Gerais
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Sistema
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="GMAPS"
            />
            <p className="mt-2 text-sm text-slate-500">
              Nome que aparecerá no sistema
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL da Logo
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="/path/to/logo.png"
              />
              {logoUrl && (
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <span className="text-sm text-slate-600">Preview da logo</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Caminho ou URL da imagem da logo
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email do Administrador
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="admin@exemplo.com"
            />
            <p className="mt-2 text-sm text-slate-500">
              Email principal para contato e notificações
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
