import Link from 'next/link';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard' },
  { href: '/app/tenants', label: 'Tenants' },
  { href: '/app/agents', label: 'Agents' },
  { href: '/app/integrations', label: 'Integrations' },
  { href: '/app/analytics', label: 'Analytics' },
  { href: '/app/compliance-security', label: 'Compliance & Security' },
  { href: '/app/billing-resource-management', label: 'Billing & Resource Management' },
  { href: '/app/settings', label: 'Settings' },
  { href: '/app/user-management', label: 'User Management' },
  { href: '/app/support-documentation', label: 'Support & Documentation' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 space-y-2 border-r border-gray-200 dark:border-gray-700">
      <div className="text-xl font-semibold mb-4">AgentForge</div>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="block py-2 px-3 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
