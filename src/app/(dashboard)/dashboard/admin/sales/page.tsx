import { RequirePermission } from "@/components/shared/RequirePermission";

export default function salesPage() {
  return (
    <RequirePermission module="sales" action="view">
      <div className="p-6"><h1 className="text-2xl font-bold capitalize">sales</h1></div>
    </RequirePermission>
  );
}