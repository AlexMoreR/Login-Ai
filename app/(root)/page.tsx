import { db } from "@/lib/db";
import { redirect } from "next/navigation";

import { currentUser } from "@/lib/auth";

const HomePage = async () => {

  const session = await currentUser();

  const user = await db.user.findUnique({
    where: {email: session?.email ?? ""}
  });

    // Si no hay sesión o usuario, redirige al login
    if (!session || !user) {
      // Redirigir al login
      redirect("/login");
      return null; // Asegúrate de devolver null después de redirigir
    }


  return <div>HomePage Aizenbots</div>;
};
export default HomePage;
