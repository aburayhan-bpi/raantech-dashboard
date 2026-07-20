import TeamManagementClient from "@/components/dashboard/pages/super-admin/team/TeamManagementClient";

export const metadata = {
  title: "Team Management | Raantech",
  description: "Manage admins and staff members",
};

export default function TeamManagementPage() {
  return (
    <div className="">
      <TeamManagementClient />
    </div>
  );
}
