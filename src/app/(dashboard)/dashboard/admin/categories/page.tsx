import { RequirePermission } from "@/components/shared/RequirePermission";

export default function categoriesPage() {
  return (
    <RequirePermission module="categories" action="view">
      <div className="p-6"><h1 className="text-2xl font-bold capitalize">categories</h1></div>
    </RequirePermission>
  );
}