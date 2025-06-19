import { useState } from "react";
import { AgentManagement } from "./AgentManagement";
import { Analytics } from "./Analytics";
import { Integrations } from "./Integrations";
import { UserManagement } from "./UserManagement";
import { TenantSettings } from "./TenantSettings";

type TabType = "overview" | "agents" | "integrations" | "users" | "analytics" | "settings";

export function Dashboard({ overview, currentUser }: { overview?: any; currentUser?: any }) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  if (!overview || !currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: "📊" },
    { id: "agents", name: "Agents", icon: "🤖" },
    { id: "integrations", name: "Integrations", icon: "🔗" },
    { id: "users", name: "Users", icon: "👥" },
    { id: "analytics", name: "Analytics", icon: "📈" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{overview.tenant.name}</h2>
          <p className="text-sm text-gray-500">{overview.tenant.domain}</p>
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              overview.tenant.status === "active" ? "bg-green-100 text-green-800" :
              overview.tenant.status === "trial" ? "bg-blue-100 text-blue-800" :
              "bg-red-100 text-red-800"
            }`}>
              {overview.tenant.status}
            </span>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                {currentUser.name?.[0] || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "overview" && <OverviewTab overview={overview} />}
        {activeTab === "agents" && <AgentManagement />}
        {activeTab === "integrations" && <Integrations />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "analytics" && <Analytics />}
        {activeTab === "settings" && <TenantSettings overview={overview} />}
      </div>
    </div>
  );
}

function OverviewTab({ overview }: { overview: any }) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Monitor your AI agents and organization metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Active Agents"
          value={overview.stats.activeAgents}
          total={overview.stats.totalAgents}
          icon="🤖"
          color="blue"
        />
        <StatCard
          title="Total Executions"
          value={overview.stats.totalExecutions}
          icon="⚡"
          color="green"
        />
        <StatCard
          title="Monthly Cost"
          value={`$${overview.stats.monthlyCost.toFixed(2)}`}
          icon="💰"
          color="purple"
        />
        <StatCard
          title="Token Usage"
          value={overview.stats.monthlyTokens.toLocaleString()}
          icon="🔤"
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Agent Types Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agents by Type</h3>
          <div className="space-y-3">
            {Object.entries(overview.agentsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${((count as number) / overview.stats.totalAgents) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Executions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Executions</h3>
          <div className="space-y-3">
            {overview.recentExecutions.length > 0 ? (
              overview.recentExecutions.map((execution: any) => (
                <div key={execution._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {execution.input || "No input"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(execution._creationTime).toLocaleString()}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    execution.status === "completed" ? "bg-green-100 text-green-800" :
                    execution.status === "failed" ? "bg-red-100 text-red-800" :
                    execution.status === "running" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {execution.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No recent executions</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🤖</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Create Agent</p>
              <p className="text-sm text-gray-500">Deploy a new AI agent</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl">🔗</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add Integration</p>
              <p className="text-sm text-gray-500">Connect external services</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-2xl">👥</span>
            <div className="text-left">
              <p className="font-medium text-gray-900">Invite User</p>
              <p className="text-sm text-gray-500">Add team members</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, total, icon, color }: {
  title: string;
  value: string | number;
  total?: number;
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {total && <span className="text-lg text-gray-500">/{total}</span>}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}
