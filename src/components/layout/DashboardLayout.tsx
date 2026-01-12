import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Star,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Lock,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function DashboardLayout({ children, currentPage, onNavigate }: DashboardLayoutProps) {
  const { signOut, user, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'empresas', label: 'Empresas', icon: Building2, adminOnly: true },
    { id: 'avaliacoes', label: 'Avaliações', icon: Star, adminOnly: true },
    { id: 'logs', label: 'Logs', icon: FileText, adminOnly: true },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, adminOnly: true },
    { id: 'senha', label: 'Alterar Senha', icon: Lock, adminOnly: false },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src="/chatgpt_image_10_de_jan._de_2026,_23_15_19.png"
                alt="GMAPS Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-white">GMAPS</h1>
                <p className="text-sm text-slate-400">Admin Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="mb-4 p-4 bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-400">Logado como</p>
              <p className="text-white font-medium truncate">{user?.email}</p>
              {isAdmin && (
                <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900">
              {visibleMenuItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>
        </div>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
