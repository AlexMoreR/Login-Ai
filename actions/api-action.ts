"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    // Validación de campos
    if (!instanceName || !userId) {
      throw new Error('Todos los campos son obligatorios');
    }

    // Verificar si el usuario ya tiene una instancia activa
    const instanciaActiva = await verificarInstanciaActiva(userId);
    if (instanciaActiva) {
      return { success: false, message: "El usuario ya tiene una instancia activa.", instancia: instanciaActiva };
    }

    // Obtener la clave de API y el server-url del administrador desde la base de datos
    const apiKeyRecord = await db.apiKey.findFirst();

    if (!apiKeyRecord) {
      throw new Error('No se encontró una clave API para este usuario.');
    }

    const { key: apiKey, url: serverUrl } = apiKeyRecord; // Extraemos la apiKey y serverUrl de la base de datos

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

    // Guardar la nueva instancia en la base de datos si la creación en la API fue exitosa
    const nuevaInstancia = await db.instancias.create({
      data: {
        instanceName,
        userId
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

