export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <DashboardCard title="Users" value="--" />
        <DashboardCard title="Active Listings" value="--" />
        <DashboardCard title="Open Reports" value="--" />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
