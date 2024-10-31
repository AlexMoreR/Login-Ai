import { auth } from "@/auth";
import { db } from "@/lib/db";

import { agregarApi } from "@/actions/api-action";
import ApiKeysTable from "@/components/shared/apikeystable";

const AdminPage = async () => {
  const session = await auth();

  const user = await db.user.findUnique({
    where: {email: session?.user.email ?? ""}
  });


  if (session?.user?.role !== "admin") {
    return <div>Lo sentimos este portal solo esta hecho para distruibudores.</div>
  }

  return (  
    <div className="container">
      {/* <pre>{JSON.stringify(session, null, 2)}</pre> */}

      {/* Muestra el mensaje de éxito o error si existe */}

      <div className="container"><form action={agregarApi} className="flex flex-col gap-y-p">
        <div className="mb-4">
          <input 
          type="text"
          name="url"
          placeholder="Ingresa la url de Evolution"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <input 
          type="text"
          name="key"
          placeholder="Ingresa la Apikey"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <input 
            type="hidden" // Usa un campo oculto para enviar el ID del usuario
            name="userId"
            value={user?.id} // Ahora puedes usar el ID del usuario
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">AGREGAR</button>
      </form></div>

      {/* <LogoutButton /> */}

      <ApiKeysTable />
    </div>
  );
};
export default AdminPage;
