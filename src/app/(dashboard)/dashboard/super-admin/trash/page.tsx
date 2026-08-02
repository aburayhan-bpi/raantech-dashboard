import TrashClient from "@/components/dashboard/pages/super-admin/trash/TrashClient";

export const metadata = {
  title: "Trash | Admin Dashboard",
  description: "Manage deleted items",
};

export default function TrashPage() {
  return <TrashClient />;
}
