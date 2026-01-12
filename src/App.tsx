import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthContainer } from './components/auth/AuthContainer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Empresas } from './pages/Empresas';
import { Avaliacoes } from './pages/Avaliacoes';
import { Logs } from './pages/Logs';
import { Configuracoes } from './pages/Configuracoes';
import { ChangePassword } from './components/auth/ChangePassword';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Carregando...</div>
      </div>
    );
  }
  if (!user) {
    return <AuthContainer />;
  }
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'empresas':
        return <Empresas />;
      case 'avaliacoes':
        return <Avaliacoes />;
      case 'logs':
        return <Logs />;
      case 'configuracoes':
        return <Configuracoes />;
      case 'senha':
        return <ChangePassword />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
