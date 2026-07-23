import { RequirePermission } from "@/components/shared/RequirePermission";

export default function customersPage() {
  return (
    <RequirePermission module="customers" action="view">
      <div className="p-6"><h1 className="text-2xl font-bold capitalize">customers</h1></div>
    </RequirePermission>
  );
}