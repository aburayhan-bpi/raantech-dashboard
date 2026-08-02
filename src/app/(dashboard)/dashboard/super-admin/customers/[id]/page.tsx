import CustomerDetailsClient from "@/components/dashboard/pages/super-admin/customers/CustomerDetailsClient";
import { RequirePermission } from "@/components/shared/RequirePermission";

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequirePermission module="customers" action="view">
      <CustomerDetailsClient id={id} />
    </RequirePermission>
  );
}
