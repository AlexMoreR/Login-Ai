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

      // Crear la nueva instancia si no existe una
      const nuevaInstancia = await db.instancias.create({
          data: {
              instanceName,
              userId,
          },
      });

      // Revalidar la página si es necesario
      revalidatePath('/agregar-api');

      return { success: true, message: "Instancia creada exitosamente.", instancia: nuevaInstancia };
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