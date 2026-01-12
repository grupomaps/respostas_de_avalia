import { useState } from 'react';
import { Settings, Building2, Users, Key } from 'lucide-react';
import { GeneralTab } from '../components/settings/GeneralTab';
import { EmpresasTab } from '../components/settings/EmpresasTab';
import { UsersTab } from '../components/settings/UsersTab';
import { IntegrationsTab } from '../components/settings/IntegrationsTab';

type TabId = 'geral' | 'empresas' | 'usuarios' | 'integracoes';

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState<TabId>('geral');

  const tabs = [
    {
      id: 'geral' as TabId,
      label: 'Geral',
      icon: Settings,
      component: GeneralTab,
    },
    {
      id: 'empresas' as TabId,
      label: 'Empresas',
      icon: Building2,
      component: EmpresasTab,
    },
    {
      id: 'usuarios' as TabId,
      label: 'Usuários',
      icon: Users,
      component: UsersTab,
    },
    {
      id: 'integracoes' as TabId,
      label: 'Chaves & Integrações',
      icon: Key,
      component: IntegrationsTab,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || GeneralTab;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
}
