"use client"
import { obtenerApiKeys, editarApiKey, eliminarApiKey } from "@/actions/api-action"; // Asegúrate de ajustar la ruta según tu estructura
import { useEffect, useState } from "react";

const ApiKeysTable = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ url: string; key: string; userId: string }>({ url: "", key: "", userId: "" });

  useEffect(() => {
    const fetchApiKeys = async () => {
      const response = await obtenerApiKeys();
      if (response.success) {
        setApiKeys(response.data || []);
      } else {
        setError(response.message);
      }
    };
    
    fetchApiKeys();
  }, []);

  const handleEdit = async (id: string) => {
    const response = await editarApiKey(id, editData);
    if (response.success) {
      // Actualizar la lista después de la edición
      setApiKeys(apiKeys.map((apiKey) => (apiKey.id === id ? { ...apiKey, ...editData } : apiKey)));
      setEditId(null);
      setEditData({ url: "", key: "", userId: "" });
    } else {
      setError(response.message);
    }
  };

  const handleDelete = async (id: string) => {
    const response = await eliminarApiKey(id);
    if (response.success) {
      // Filtrar la API Key eliminada
      setApiKeys(apiKeys.filter((apiKey) => apiKey.id !== id));
    } else {
      setError(response.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">URL</th>
            <th className="px-4 py-2 border">API Key</th>
            <th className="px-4 py-2 border">User ID</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center px-4 py-2">No hay API Keys creadas.</td>
            </tr>
          ) : (
            apiKeys.map((apiKey) => (
              <tr key={apiKey.id}>
                <td className="px-4 py-2 border">
                  {editId === apiKey.id ? (
                    <input
                      type="text"
                      value={editData.url}
                      onChange={(e) => setEditData({ ...editData, url: e.target.value })}
                      className="border px-2 py-1"
                    />
                  ) : (
                    apiKey.url
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editId === apiKey.id ? (
                    <input
                      type="text"
                      value={editData.key}
                      onChange={(e) => setEditData({ ...editData, key: e.target.value })}
                      className="border px-2 py-1"
                    />
                  ) : (
                    apiKey.key
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editId === apiKey.id ? (
                    <input
                      type="text"
                      value={editData.userId}
                      onChange={(e) => setEditData({ ...editData, userId: e.target.value })}
                      className="border px-2 py-1"
                    />
                  ) : (
                    apiKey.userId
                  )}
                </td>
                <td className="px-4 py-2 border">
                  {editId === apiKey.id ? (
                    <>
                      <button
                        onClick={() => handleEdit(apiKey.id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        💾
                      </button>
                      <button
                        onClick={() => {
                          setEditId(null);
                          setEditData({ url: "", key: "", userId: "" });
                        }}
                        className="bg-gray-300 text-black px-2 py-1 rounded ml-2"
                      >
                         X
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditId(apiKey.id);
                          setEditData({ url: apiKey.url, key: apiKey.key, userId: apiKey.userId });
                        }}
                        className="bg-slate-100 text-white px-2 py-1 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(apiKey.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      >
                        X
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ApiKeysTable;
