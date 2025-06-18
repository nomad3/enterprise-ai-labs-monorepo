import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function TenantSettings() {
  const [activeTab, setActiveTab] = useState<"general" | "billing" | "security" | "webhooks">("general");
  const overview = useQuery(api.tenants.getTenantOverview);
  const updateSettings = useMutation(api.tenants.updateTenantSettings);

  const [settings, setSettings] = useState({
    maxAgents: 5,
    allowedAgentTypes: ["dev", "qa", "documentation"],
    features: ["basic_agents", "basic_integrations"],
  });

  const handleSaveSettings = async () => {
    try {
      await updateSettings({ settings });
      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    }
  };

  if (!overview) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: "general", name: "General", icon: "⚙️" },
    { id: "billing", name: "Billing", icon: "💳" },
    { id: "security", name: "Security", icon: "🔒" },
    { id: "webhooks", name: "Webhooks", icon: "🔗" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your organization settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={overview.tenant.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain
                </label>
                <input
                  type="text"
                  value={overview.tenant.domain}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Limits</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Agents ({settings.maxAgents})
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.maxAgents}
                  onChange={(e) => setSettings({ ...settings, maxAgents: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allowed Agent Types
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["dev", "devops", "qa", "data_science", "bi", "security", "documentation"].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.allowedAgentTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings({
                              ...settings,
                              allowedAgentTypes: [...settings.allowedAgentTypes, type]
                            });
                          } else {
                            setSettings({
                              ...settings,
                              allowedAgentTypes: settings.allowedAgentTypes.filter(t => t !== type)
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Trial Plan</h4>
                <p className="text-sm text-blue-700">Free trial with basic features</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage This Month</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{overview.stats.totalExecutions}</p>
                <p className="text-sm text-gray-600">Executions</p>
                <p className="text-xs text-gray-500">of 1,000 limit</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{overview.stats.activeAgents}</p>
                <p className="text-sm text-gray-600">Active Agents</p>
                <p className="text-xs text-gray-500">of 5 limit</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">${overview.stats.monthlyCost.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Current Cost</p>
                <p className="text-xs text-gray-500">this month</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Enable
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-600">Automatically log out inactive users</p>
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Audit Logs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track all actions performed in your organization
            </p>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              View Audit Logs
            </button>
          </div>
        </div>
      )}

      {activeTab === "webhooks" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Webhooks</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Webhook
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configure webhooks to receive real-time notifications about events in your organization
            </p>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔗</div>
              <h4 className="font-medium text-gray-900 mb-1">No webhooks configured</h4>
              <p className="text-sm text-gray-500">Add your first webhook to get started</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
