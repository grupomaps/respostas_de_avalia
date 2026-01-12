import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Shield, ShieldOff, AlertCircle, CheckCircle, X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  role?: 'admin' | 'user';
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) throw authError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const rolesMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      const usersWithRoles = authUsers.users.map(u => ({
        id: u.id,
        email: u.email || '',
        created_at: u.created_at,
        role: rolesMap.get(u.id) || 'user',
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error loading users:', error);
      showMessage('error', 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      showMessage('error', 'Preencha email e senha');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: newUserRole,
        });

        showMessage('success', 'Usuário criado com sucesso!');
        setShowModal(false);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('user');
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      showMessage('error', error.message || 'Erro ao criar usuário');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: newRole,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      showMessage('success', `Permissão alterada para ${newRole}`);
      loadUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      showMessage('error', error.message || 'Erro ao alterar permissão');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      showMessage('success', 'Usuário excluído com sucesso!');
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showMessage('error', error.message || 'Erro ao excluir usuário');
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

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Gerenciar Usuários
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Perfil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                          Operador
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRole(user.id, user.role || 'user')}
                          className="text-blue-600 hover:text-blue-700 transition"
                          title={user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                        >
                          {user.role === 'admin' ? (
                            <ShieldOff className="w-5 h-5" />
                          ) : (
                            <Shield className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 transition"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Criar Novo Usuário</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="usuario@exemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Perfil
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="user">Operador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
