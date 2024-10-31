import { auth } from "@/auth";
import { db } from "@/lib/db";

import { agregarApi } from "@/actions/api-action";
import Image from "next/image"
import Link from "next/link"
import ConexionButton from "@/components/shared/conexion";
import Header from "@/components/shared/header";

const AdminPage = async () => {
  const session = await auth();

  const user = await db.user.findUnique({
    where: {email: session?.user.email ?? ""}
  });


  if (session?.user?.role !== "admin") {
    return <div>Lo sentimos este portal solo esta hecho para distruibudores.</div>;
  }

  return (  
    <>
      <Header 
        title='Panel Administrativo'
        subtitle='Puedes administrar cualquier operacion en la plataforma'
      />
    <div className="p-2">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ConexionButton />
        {/* Agrega más botones o *cards* si es necesario */}
      </div>
    </div>
    </>
  );
};
export default AdminPage;
