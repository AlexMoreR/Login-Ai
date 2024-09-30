"use client";
import { useState, useEffect } from "react";
import { verificarInstanciaActiva, createInstance } from "@/actions/api-action"; // Asegúrate de que estas funciones existan
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default function FormInstance() {
  const session = auth();

  const user = db.user.findUnique({
    where: {email: session. email ?? ""}
  });

  const [instanceName, setInstanceName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false); // Estado para verificar si la instancia ya está activa

  useEffect(() => {
    const checkActiveInstance = async () => {
      if (user?.id) {
        const activeInstance = await verificarInstanciaActiva(user.id);
        setIsActive(activeInstance); // Establece el estado si hay una instancia activa
      }
    };
    checkActiveInstance();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isActive) {
        setMessage("Ya tienes una instancia activa.");
        return;
      }

      const formData = new FormData();
      formData.append("instanceName", instanceName);
      formData.append("userId", user.id); // Usa el ID del usuario actual

      const result = await createInstance(formData);

      if (result.success) {
        setMessage(result.message);
        // Aquí podrías redirigir o actualizar el estado según sea necesario
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("Error al crear la instancia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Crear Nueva Instancia</h2>
      {isActive ? (
        <p>Ya tienes una instancia activa.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre de la instancia"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creando instancia..." : "Crear Instancia"}
          </button>
          {message && <p>{message}</p>}
        </form>
      )}
    </div>
  );
}
