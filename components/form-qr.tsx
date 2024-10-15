'use client';

import React, { useEffect, useState } from 'react';
import { getInstances } from '@/actions/api-action'; // Importa la server action

interface QRCodeGeneratorProps {
    instanceName: string;
    instanceId: string;
}

interface QRCodeGeneratorComponentProps {
    userId: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorComponentProps> = ({ userId }) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [instanceData, setInstanceData] = useState<QRCodeGeneratorProps | null>(null); // Cambiado el tipo de estado
    const [connectionStatus, setConnectionStatus] = useState<string | null>(null); // Estado de la conexión



    const fetchQRCode = async (instance: string, apiKey: string) => {
        setLoading(true);
        try {
            const response = await fetch(`https://conexion.aizenbots.com/instance/connect/${instance}`, {
                method: 'GET',
                headers: {
                    apikey: apiKey,
                },
            });
            const data = await response.json();

            if (data.base64) {
                setQrCode(data.base64);
            } else if (data.instance.state === 'open') {
                setConnectionStatus('Conexión establecida');
                setQrCode(null); // No se muestra el QR si ya está conectado
            } else {
                setError('No se pudo generar el código QR.');
            }
        } catch (err) {
            setError('Error al obtener el código QR: ' + (err instanceof Error ? err.message : String(err)));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadInstances = async () => {
            try {
                const instances = await getInstances(userId); // Llama a la server action con el userId
                
                // Verifica si instances es un array válido
                if (Array.isArray(instances) && instances.length > 0) {
                    const { instanceName, instanceId } = instances[0]; // Accede al primer elemento del array
                    setInstanceData({ instanceName, instanceId }); // Ajusta el estado con el objeto correcto
                    fetchQRCode(instanceName, instanceId); // Usa instanceId como apiKey

                    // Refresca el QR cada 40 segundos
                    const intervalId = setInterval(() => {
                        fetchQRCode(instanceName, instanceId);
                    }, 15000);

                    return () => clearInterval(intervalId);
                } else {
                    setError('No se encontraron instancias para este usuario.');
                }
            } catch (error) {
                setError('Error al cargar instancias: ');
            }
        };

        loadInstances(); // Carga las instancias al montar el componente
    }, [userId]); // Dependencia en userId

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h3>Código QR</h3>
            {connectionStatus ? (
            <p>{connectionStatus}</p>
            ) : (
                <>
                <p>Generando código QR...</p>
                {qrCode && <img src={qrCode} alt="Código QR" />}
                </>
            )}
        </div>
    );
};

export default QRCodeGenerator;
