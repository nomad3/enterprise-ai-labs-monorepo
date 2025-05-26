export default function DashboardPage() {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold">Enterprise Dashboard</h1>
      <p className="mt-4">High-level metrics: active tenants, agents, usage, compliance status, incidents, cost.</p>
      <p className="mt-2">Quick links to key actions (add tenant, deploy agent, view audit logs).</p>
    </div>
  );
}
