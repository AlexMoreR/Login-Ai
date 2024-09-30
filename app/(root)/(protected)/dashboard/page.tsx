import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import MobileNav from "@/components/shared/MobileNav";
import Sidebar from "@/components/shared/Sidebar";
import FormInstance from "@/components/form-Instance";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    return <div>Not authenticated</div>;
  }

  return (
    <FormInstance />
  );
}
