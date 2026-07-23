import { RequirePermission } from "@/components/shared/RequirePermission";

export default function expensesPage() {
  return (
    <RequirePermission module="expenses" action="view">
      <div className="p-6"><h1 className="text-2xl font-bold capitalize">expenses</h1></div>
    </RequirePermission>
  );
}