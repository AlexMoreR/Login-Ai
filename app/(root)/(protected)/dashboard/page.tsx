import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import { db } from "@/lib/db";


import { currentUser } from "@/lib/auth";
import { UserInfo } from "@/components/user-info";
import FormInstance from "@/components/form-Instance";
import WhatsAppInstanceStatus from "@/components/form-qr";
import EnableToggleButton from "@/components/button-bot";


export default async function DashboardPage() {

  const session = await currentUser();

  const user = await db.user.findUnique({
    where: {email: session?.email ?? ""}
  });

  if (!user) {
    return <div>Not authenticated</div>;
  }

  return (
    <>
      <FormInstance userId={user.id} />
      
      <EnableToggleButton userId={user.id} />
      <WhatsAppInstanceStatus userId={user.id} />
    </>

  );
}
