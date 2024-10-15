"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface WhatsAppConnectionStatus {
  qr?: {
    code: string; // Código QR en formato base64
    pairingCode: string; // Código de emparejamiento
  };
  connectionState?: {
    instance: {
      state: string; // Estado de la conexión (e.g. 'open', 'closed')
    };
  };
  success: boolean; // Indica si la conexión fue exitosa
}

export async function agregarApi(data: FormData) {
    const url = data.get('url') as string;
    const key = data.get('key') as string;
    const userId = data.get('userId') as string;
  
    try {
        // Validación de campos
        if (!url || !key || !userId) {
          throw new Error('Todos los campos son obligatorios');
        }
    
        // Crear la API Key en la base de datos
        await db.apiKey.create({
          data: {
            url,
            key,
            userId,
          },
        });
    
        // Revalidar la página si es necesario
        revalidatePath('/agregar-api');
    
        // Retorna un estado de éxito
        return { success: true, message: "API Key agregada exitosamente." };
      } catch (error: any) {
        // Manejo de errores
        return { success: false, message: error.message || "Error al agregar la API Key." };
      }
}

// Función para crear una instancia si el usuario no tiene una
export async function createInstance(data: FormData) {
  const instanceName = data.get('instanceName') as string;
  const userId = data.get('userId') as string;

  try {
    // Validación de campos obligatorios
    if (!instanceName || !userId) {
      throw new Error('Todos los campos son obligatorios');
    }

    // Verificar si el usuario ya tiene una instancia activa
    const instanciaActiva = await verificarInstanciaActiva(userId);
    if (instanciaActiva) {
      return { success: false, message: "El usuario ya tiene una instancia activa.", instancia: instanciaActiva };
    }

    // Obtener la clave de API y la URL del servidor desde la base de datos
    const apiKeyRecord = await db.apiKey.findFirst();
    if (!apiKeyRecord) {
      throw new Error('No se encontró una clave API para este usuario.');
    }

    const { key: apiKey, url: serverUrl } = apiKeyRecord;

    // Configurar las opciones para la llamada a la API externa
    const options = {
      method: 'POST',
      headers: {
        'apikey': apiKey,  // Usar la clave API obtenida de la base de datos
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instanceName: instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS"
      })
    };

    // Realizar la llamada a la API externa usando el serverUrl
    const response = await fetch(`https://${serverUrl}/instance/create`, options);
    const apiResult = await response.json();

    // Manejo de errores en la respuesta de la API
    if (!response.ok) {
      throw new Error(apiResult.message || 'Error al crear la instancia en la API.');
    }

    // Extraer el instanceId desde el objeto "instance" en la respuesta de la API
    const instanceId = apiResult.hash;
    if (!instanceId) {
      throw new Error('No se recibió instanceId en la respuesta de la API.');
    }

    // Guardar la nueva instancia en la base de datos si la creación en la API fue exitosa
    const nuevaInstancia = await db.instancias.create({
      data: {
        instanceName,
        userId,
        instanceId,  // Usar el instanceId extraído de la respuesta
      },
    });

    // Revalidar la página si es necesario
    revalidatePath('/agregar-api');

    return { success: true, message: "Instancia creada exitosamente.", instancia: nuevaInstancia, apiResult };
  } catch (error: any) {
    return { success: false, message: error.message || "Error al crear la instancia." };
  }
}

// Función para verificar si el usuario ya tiene una instancia
export async function verificarInstanciaActiva(userId: string) {
    const instanciaActiva = await db.instancias.findFirst({
        where: { userId },
    });

    return instanciaActiva;
}

export async function getWhatsAppConnectionStatus(userId: string) {
  // Obtener el instanceName y instanceId directamente desde la base de datos
  const instance = await db.instancias.findFirst({
    where: { userId },
    select: {
      instanceName: true,
      instanceId: true,
    },
  });

  if (!instance) {
    throw new Error(`No instance found for userId: ${userId}`);
  }

  const { instanceName, instanceId } = instance;

  const fetchOptions = {
    method: 'GET',
    headers: { apikey: instanceId },
  };

  // Función para realizar fetch con manejo de errores
  const fetchWithErrorHandling = async (url: string) => {
    try {
      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud.');
      }

      return data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      return null;
    }
  };

  // Función para obtener el QR
  const fetchQR = async () => {
    const url = `https://conexion.aizenbots.com/instance/connect/${instanceName}`;
    return await fetchWithErrorHandling(url);
  };

  // Función para obtener el estado de conexión
  const fetchConnectionState = async () => {
    const url = `https://conexion.aizenbots.com/instance/connectionState/${instanceName}`;
    return await fetchWithErrorHandling(url);
  };

  // Función para actualizar el estado y retornarlo
  const updateStatus = async () => {
    const qr = await fetchQR();
    const connectionState = await fetchConnectionState();

    if (connectionState) {
      const { state } = connectionState.instance;
      if (state === 'open') {
        return { success: true, message: 'Conexión establecida', connectionState };
      }
    }

    return { success: false, qr };
  };

  // Llamada inicial para obtener el estado
  const initialStatus = await updateStatus();

  // Configuración del intervalo para actualizar el estado de la conexión cada 40 segundos
  const intervalId = setInterval(async () => {
    const statusUpdate = await updateStatus();
    console.log(statusUpdate); // Aquí puedes realizar la lógica para actualizar la UI
  }, 40000);

  // Retornar el estado inicial y el intervalo
  return {
    status: initialStatus,
    intervalId
  };
}

// Funcion para traer datos del cliente
export async function getInstances(userId: string) {
  try {
    const instances = await db.instancias.findMany({
        where: {
            userId: userId,
        },
        select: {
            instanceName: true,
            instanceId: true,
        },
    });

    return instances;
  } catch (error) {
      console.error(`Error fetching from:`, error);
  }
}