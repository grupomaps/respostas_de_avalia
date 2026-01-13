/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { supabase, Empresa } from "../lib/supabase";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Link2,
  Unlink,
} from "lucide-react";

export function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    email_responsavel: "",
    google_place_id: "",
    automacao_ativa: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmpresas(data || []);
    } catch (error) {
      console.error("Error loading empresas:", error);
      showMessage("error", "Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const openModal = (empresa?: Empresa) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setFormData({
        nome: empresa.nome,
        email_responsavel: empresa.email_responsavel,
        google_place_id: empresa.google_place_id,
        automacao_ativa: empresa.automacao_ativa,
      });
    } else {
      setEditingEmpresa(null);
      setFormData({
        nome: "",
        email_responsavel: "",
        google_place_id: "",
        automacao_ativa: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmpresa(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEmpresa) {
        const { error } = await supabase
          .from("empresas")
          .update(formData)
          .eq("id", editingEmpresa.id);

        if (error) throw error;
        showMessage("success", "Empresa atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("empresas").insert([formData]);

        if (error) throw error;
        showMessage("success", "Empresa criada com sucesso!");
      }

      closeModal();
      loadEmpresas();
    } catch (error: any) {
      console.error("Error saving empresa:", error);
      showMessage("error", error.message || "Erro ao salvar empresa");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      const { error } = await supabase.from("empresas").delete().eq("id", id);

      if (error) throw error;
      showMessage("success", "Empresa excluída com sucesso!");
      loadEmpresas();
    } catch (error: any) {
      console.error("Error deleting empresa:", error);
      showMessage("error", error.message || "Erro ao excluir empresa");
    }
  };

  const toggleGoogleConectado = async (
    empresaId: string,
    valorAtual: boolean
  ) => {
    const { error } = await supabase
      .from("empresas")
      .update({ google_conectado: !valorAtual })
      .eq("id", empresaId);

    if (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  };


  const conectarGoogle = async (empresa: Empresa) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

    const options = {
      redirect_uri: "http://localhost:5173/auth/google/callback",
      // redirect_uri: "https://respostas-de-avalia.vercel.app/auth/google/callback",
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: ["https://www.googleapis.com/auth/business.manage"].join(" "),
      state: empresa.id,
    };

    const qs = new URLSearchParams(options).toString();

    window.location.href = `${rootUrl}?${qs}`;
  };
  const desconectarGoogle = async (empresaId: string) => {
    if (!confirm("Deseja desconectar esta empresa do Google?")) return;

    try {
      const { error } = await supabase
        .from("empresas")
        .update({
          google_conectado: false,
          access_token: "",
          refresh_token: "",
        })
        .eq("id", empresaId);

      if (error) throw error;

      await supabase.from("logs").insert({
        tipo: "info",
        mensagem: `Empresa desconectada do Google: ${empresaId}`,
      });

      showMessage("success", "Empresa desconectada com sucesso!");
      loadEmpresas();
    } catch (error: any) {
      console.error("Error disconnecting:", error);
      showMessage("error", error.message || "Erro ao desconectar");
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
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          />
          <p
            className={`text-sm ${
              message.type === "success" ? "text-green-800" : "text-red-800"
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">
          Empresas Cadastradas
        </h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Place ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Google
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Automação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {empresas.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Nenhuma empresa cadastrada
                  </td>
                </tr>
              ) : (
                empresas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {empresa.nome}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-600">
                        {empresa.email_responsavel}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-600 text-sm">
                        {empresa.google_place_id || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {empresa.google_conectado ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          <CheckCircle className="w-3 h-3" />
                          Conectado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                          <XCircle className="w-3 h-3" />
                          Desconectado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {empresa.automacao_ativa ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                          <CheckCircle className="w-3 h-3" />
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
                          <XCircle className="w-3 h-3" />
                          Inativa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* <button
                          onClick={() =>
                            toggleGoogleConectado(
                              empresa.id,
                              empresa.google_conectado
                            )
                          }
                        >
                          Toggle Google
                        </button> */}
                        {empresa.google_conectado ? (
                          <button
                            onClick={() => desconectarGoogle(empresa.id)}
                            className="text-orange-600 hover:text-orange-700 transition"
                            title="Desconectar Google"
                          >
                            <Unlink className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => conectarGoogle(empresa)}
                            className="text-green-600 hover:text-green-700 transition"
                            title="Conectar com Google"
                          >
                            <Link2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openModal(empresa)}
                          className="text-blue-600 hover:text-blue-700 transition"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(empresa.id)}
                          className="text-red-600 hover:text-red-700 transition"
                          title="Excluir"
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
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingEmpresa ? "Editar Empresa" : "Nova Empresa"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email do Responsável
                </label>
                <input
                  type="email"
                  value={formData.email_responsavel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email_responsavel: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Google Place ID
                </label>
                <input
                  type="text"
                  value={formData.google_place_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      google_place_id: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="ChIJ..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="automacao_ativa"
                  checked={formData.automacao_ativa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      automacao_ativa: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="automacao_ativa"
                  className="ml-2 text-sm font-medium text-slate-700"
                >
                  Ativar automação de respostas
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  {editingEmpresa ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
