import CategoryClient from "@/components/dashboard/pages/super-admin/categories/CategoryClient";
import { RequirePermission } from "@/components/shared/RequirePermission";

export default function categoriesPage() {
  return (
    <RequirePermission module="categories" action="view">
      <CategoryClient />
    </RequirePermission>
  );
}