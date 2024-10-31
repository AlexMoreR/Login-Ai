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

  export async function editarApiKey(id: string, data: { url: string; key: string; userId: string; }) {
    try {
      // Actualizar la API Key en la base de datos
      await db.apiKey.update({
        where: { id },
        data,
      });
      
      // Revalidar la página si es necesario
      revalidatePath('/agregar-api');
      
      return { success: true, message: "API Key actualizada exitosamente." };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al actualizar la API Key." };
    }
  }

  export async function eliminarApiKey(id: string) {
    try {
      // Eliminar la API Key de la base de datos
      await db.apiKey.delete({
        where: { id },
      });
      
      // Revalidar la página si es necesario
      revalidatePath('/agregar-api');
      
      return { success: true, message: "API Key eliminada exitosamente." };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al eliminar la API Key." };
    }
  }

  export async function obtenerApiKeys() {
    try {
      // Obtener todas las API Keys de la base de datos
      const apiKeys = await db.apiKey.findMany();
      
      return { success: true, data: apiKeys };
    } catch (error: any) {
      // Manejo de errores
      return { success: false, message: error.message || "Error al obtener las API Keys." };
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

  export async function eliminarInstancia(userId: string) {
    try {
        // Verificar si el usuario tiene una instancia activa
        const instanciaActiva = await verificarInstanciaActiva(userId);
        if (!instanciaActiva) {
            return { success: false, message: "El usuario no tiene ninguna instancia activa." };
        }

        const instanceName = instanciaActiva.instanceName;

        // Obtener la clave de API y la URL del servidor desde la base de datos
        const apiKeyRecord = await db.apiKey.findFirst();
        if (!apiKeyRecord) {
            throw new Error('No se encontró una clave API para este usuario.');
        }

        const { key: apiKey, url: serverUrl } = apiKeyRecord;

        // 1. Logout de la instancia
        const logoutOptions = {
            method: 'DELETE',
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        };

        const logoutResponse = await fetch(`https://${serverUrl}/instance/logout/${instanceName}`, logoutOptions);
        const logoutResult = await logoutResponse.json();

        if (!logoutResponse.ok) {
            throw new Error(logoutResult.message || 'Error al hacer logout de la instancia en la API.');
        }

        // 2. Eliminar la instancia en la API
        const deleteOptions = {
            method: 'DELETE',
            headers: {
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        };

        const deleteResponse = await fetch(`https://${serverUrl}/instance/delete/${instanceName}`, deleteOptions);
        const deleteResult = await deleteResponse.json();

        if (!deleteResponse.ok) {
            throw new Error(deleteResult.message || 'Error al eliminar la instancia en la API.');
        }

        // 3. Eliminar la instancia de la base de datos
        await db.instancias.delete({
            where: {
                instanceName: instanceName,
            },
        });

        return { success: true, message: "Instancia eliminada exitosamente." };
    } catch (error: any) {
        return { success: false, message: error.message || "Error al eliminar la instancia." };
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

  // actions/createBotAction.ts

  export async function createBotAction(data: FormData) {
    const instanceName = data.get('instanceName') as string;
    const instanceId = data.get('instanceId') as string;
    const systemMessage = data.get('systemMessage') as string;


    if (!instanceName || !instanceId || !systemMessage) {
      throw new Error('Faltan datos necesarios.');
    }

    const requestBody = {
      enabled: true,
      openaiCredsId: 'cm2nql5yd6e7g12gecbdrflit',
      botType: 'chatCompletion',
      model: 'gpt-4',
      systemMessages: [systemMessage],
      assistantMessages: ['\n\nHello there, how may I assist you today?'],
      userMessages: ['Hello!'],
      maxTokens: 300,
      triggerType: 'keyword',
      triggerOperator: 'equals',
      triggerValue: 'test',
      expire: 20,
      keywordFinish: '#EXIT',
      delayMessage: 1000,
      unknownMessage: 'Message not recognized',
      listeningFromMe: false,
      stopBotFromMe: false,
      keepOpen: false,
      debounceTime: 10,
      ignoreJids: [],
    };

    try {
      const response = await fetch(`https://conexion.aizenbots.com/openai/create/${instanceName}`, {
        method: 'POST',
        headers: {
          'apikey': instanceId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el bot');
      }

      return await response.json();
    } catch (err) {
      console.error(`Error:`, err);
    }
  }

  //Guardar mensaje del systema por usuario

  export async function agregarMensaje(data: FormData) {
    const message = data.get('message') as string;
    const userId = data.get('userId') as string;

    try {
      // Validación de campos
      if (!message || !userId) {
        throw new Error('Todos los campos son obligatorios');
      }

      // Crear el mensaje en la base de datos
      await db.systemMessage.create({
        data: {
          message,
          user: {
            connect: { id: userId }, // Conectar el mensaje al usuario
          },
        },
      });

      // Revalidar la página si es necesario
      revalidatePath('/agregar-mensaje'); // Cambia esto a la ruta correspondiente

      // Retorna un estado de éxito
      return { success: true, message: "Mensaje del sistema agregado exitosamente." };
    } catch (error: any) {
      // Manejo de errores
      return { success: false, message: error.message || "Error al agregar el mensaje del sistema." };
    }
  }

  //Edita el systemmensaje:

  export async function obtenerMensajes(userId: string) {
    return await db.systemMessage.findMany({
      where: { userId },
    });
  }

  export async function editarMensaje(data: FormData) {
    const id = data.get('id') as string;
    const message = data.get('message') as string;

    try {
      await db.systemMessage.update({
        where: { id },
        data: { message },
      });
      return { success: true, message: "Mensaje actualizado exitosamente." };
    } catch (error) {
      return { success: false, message: "Error al actualizar el mensaje." };
    }
  }

  export async function eliminarMensaje(id: string) {
    try {
      await db.systemMessage.delete({ where: { id } });
      return { success: true, message: "Mensaje eliminado exitosamente." };
    } catch (error) {
      return { success: false, message: "Error al eliminar el mensaje." };
    }
  }