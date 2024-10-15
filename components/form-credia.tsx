'use client';

import React, { useEffect, useState } from 'react';
import { getInstances } from '@/actions/api-action'; // Importa la server action

interface OpenAICredentialProps {
  instanceName: string;
  instanceId: string;
}

interface OpenAICredentialComponentProps {
  userId: string;
}

interface OpenAICredential {
  id: string;
  name: string;
  apiKey: string;
}

const OpenAICredentialManager: React.FC<OpenAICredentialComponentProps> = ({ userId }) => {
  const [apiKey, setApiKey] = useState<string>(''); // Estado para almacenar la API Key
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openAICredential, setOpenAICredential] = useState<OpenAICredential | null>(null);
  const [instanceData, setInstanceData] = useState<OpenAICredentialProps | null>(null); // Instancia
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null); // Estado de conexión

  // URL base de la API
  const baseUrl = 'https://conexion.aizenbots.com';

  // Función para obtener las instancias y la API Key
  const fetchInstancesAndApiKey = async () => {
    try {
      const instances = await getInstances(userId); // Llama a la server action con el userId

      if (Array.isArray(instances) && instances.length > 0) {
        const { instanceName, instanceId } = instances[0]; // Toma la primera instancia
        setInstanceData({ instanceName, instanceId });

        // Obtener la API Key de la credencial almacenada
        fetchOpenAICredential(instanceName, instanceId); // Consulta la credencial al cargar
      } else {
        setError('No se encontraron instancias para este usuario.');
      }
    } catch (err) {
      setError('Error al cargar las instancias: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Consulta las credenciales de OpenAI
  const fetchOpenAICredential = async (instanceName: string, instanceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/openai/creds/${instanceName}`, {
        method: 'GET',
        headers: {
          apikey: instanceId, // Cambié el header por instanceId, asegúrate de que esto sea lo que se espera
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener la credencial.');
      }

      const data = await response.json();

      // Si la respuesta es un array vacío, no hay credenciales para esa instancia
      if (Array.isArray(data) && data.length > 0) {
        setOpenAICredential(data[0]); // Toma la primera credencial
      } else {
        // Si no hay credenciales, mostramos un mensaje (esto es importante si el array está vacío)
        setOpenAICredential(null);
      }
    } catch (err) {
      setError('Error al obtener la credencial: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Crea una nueva credencial de OpenAI
  const createOpenAICredential = async (instanceName: string, instanceId: string, apiKey: string) => {
    if (!apiKey) {
      setError('La clave API no puede estar vacía.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/openai/creds/${instanceName}`, {
        method: 'POST',
        headers: {
          apikey: instanceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'apikey',
          apiKey: apiKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la credencial.');
      }

      const data = await response.json();
      setOpenAICredential(data);
      setApiKey(''); // Limpiar el input después de crear
    } catch (err) {
      setError('Error al crear la credencial: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Elimina la credencial
  const deleteOpenAICredential = async (credId: string, instanceName: string, instanceId: string,) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/openai/creds/${credId}/${instanceName}`, {
        method: 'DELETE',
        headers: {
          apikey: instanceId, // Cambié apikey a instanceName
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la credencial.');
      }

      setOpenAICredential(null); // Limpiar la credencial después de eliminarla
    } catch (err) {
      setError('Error al eliminar la credencial: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Cargar las instancias y la credencial al montar el componente
  useEffect(() => {
    fetchInstancesAndApiKey(); // Llama a la función para cargar instancias y credencial
  }, [userId]);

  if (loading) return <p className="text-center text-lg text-gray-500">Cargando...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="">
        Conectar IA: {instanceData?.instanceName}
      </h3>

      {openAICredential ? (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-md shadow-sm">
            <p className="font-bold text-gray-700">Credencial existente:</p>
            <p className="text-gray-600">Nombre: {openAICredential.name}</p>
            <p className="text-gray-600">API Key: {openAICredential.apiKey}</p>
            <button
              onClick={() => deleteOpenAICredential(openAICredential.id, instanceData!.instanceName, instanceData!.instanceId)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              X
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-gray-800">Crear nueva credencial</h4>
          <div className="bg-white p-2 rounded-md shadow-sm border border-gray-200">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-proj-..."
              className=" p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none m-4"
            />
            <button
              onClick={() => createOpenAICredential(instanceData!.instanceName, instanceData!.instanceId, apiKey)}
              className=" bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenAICredentialManager;
