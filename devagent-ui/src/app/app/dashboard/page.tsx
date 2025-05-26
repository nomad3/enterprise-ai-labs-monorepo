import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Zap, Briefcase, BarChart2, ShieldCheck, Settings, DollarSign, User, HelpCircle, Layers, AlertTriangle, CheckCircle2, TrendingUp, Activity } from 'lucide-react';

// Dummy data for KPIs - replace with actual data fetching
const kpiData = [
  { title: "Active Tenants", value: "12", icon: <Users className="h-6 w-6 text-blue-500" />, trend: "+5%" },
  { title: "Active Agents", value: "78", icon: <Zap className="h-6 w-6 text-green-500" />, trend: "+12%" },
  { title: "Platform Uptime", value: "99.98%", icon: <CheckCircle2 className="h-6 w-6 text-green-500" />, trend: "" },
  { title: "Security Incidents", value: "1", icon: <AlertTriangle className="h-6 w-6 text-red-500" />, trend: "Last 24h" },
  { title: "Total API Calls", value: "1.2M", icon: <Activity className="h-6 w-6 text-purple-500" />, trend: "+8% MoM" },
  { title: "Estimated Costs", value: "$5,230", icon: <DollarSign className="h-6 w-6 text-yellow-500" />, trend: "This Month" },
];

const navigationCards = [
  { title: "Manage Tenants", description: "Oversee and configure all client organizations.", href: "/app/tenants", icon: <Users className="h-8 w-8 mb-2 text-indigo-500" /> },
  { title: "Orchestrate Agents", description: "Deploy, monitor, and manage AI agents.", href: "/app/agents", icon: <Zap className="h-8 w-8 mb-2 text-sky-500" /> },
  { title: "View Analytics", description: "Track usage, performance, and cost metrics.", href: "/app/analytics", icon: <BarChart2 className="h-8 w-8 mb-2 text-amber-500" /> },
  { title: "Integrations Hub", description: "Connect with enterprise tools and services.", href: "/app/integrations", icon: <Layers className="h-8 w-8 mb-2 text-rose-500" /> },
  { title: "Compliance & Security", description: "Access audit logs and manage security settings.", href: "/app/compliance-security", icon: <ShieldCheck className="h-8 w-8 mb-2 text-emerald-500" /> },
  { title: "Billing & Resources", description: "Manage subscriptions and resource allocation.", href: "/app/billing-resource-management", icon: <DollarSign className="h-8 w-8 mb-2 text-lime-500" /> },
];

export default function DashboardPage() {
  return (
    <div className="p-6 sm:p-8 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">Enterprise Dashboard</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Welcome back, Admin! Here's your platform overview.</p>
      </header>

      {/* KPIs Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          {kpiData.map((kpi) => (
            <Card key={kpi.title} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.title}</CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{kpi.value}</div>
                {kpi.trend && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{kpi.trend}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Navigation Cards Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {navigationCards.map((card) => (
            <Link href={card.href} key={card.title} legacyBehavior>
              <a className="block transform hover:scale-105 transition-transform duration-300">
                <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl h-full flex flex-col">
                  <CardHeader className="items-center text-center">
                    {card.icon}
                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center flex-grow">
                    <CardDescription className="text-gray-600 dark:text-gray-400">{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </a>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder for future charts or activity feeds */}
      <section className="mt-12">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700 dark:text-gray-300">Platform Activity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">Charts and activity feeds will be displayed here.</p>
            {/* Example: <img src="/placeholder-chart.png" alt="Activity Chart" /> */}
          </CardContent>
        </Card>
      </section>

    </div>
  );
}
