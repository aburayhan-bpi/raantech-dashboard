import { RequirePermission } from "@/components/shared/RequirePermission";

export default function productsPage() {
  return (
    <RequirePermission module="products" action="view">
      <div className="p-6"><h1 className="text-2xl font-bold capitalize">products</h1></div>
    </RequirePermission>
  );
}