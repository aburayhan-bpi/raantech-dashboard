import TeamManagementClient from "./_components/TeamManagementClient";

export const metadata = {
  title: "Team Management | Raantech",
  description: "Manage admins and staff members",
};

export default function TeamManagementPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <TeamManagementClient />
    </div>
  );
}