import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function Integrations() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const integrations = useQuery(api.integrations.listIntegrations);
  const testIntegration = useMutation(api.integrations.testIntegration);

  const handleTest = async (integrationId: Id<"integrations">) => {
    try {
      const result = await testIntegration({ integrationId });
      if (result.success) {
        toast.success("Integration test successful");
      } else {
        toast.error(`Integration test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to test integration");
    }
  };

  if (!integrations) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Connect external services and APIs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Integration
        </button>
      </div>

      {/* Available Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { name: "Slack", type: "slack", icon: "💬", description: "Send notifications and updates" },
          { name: "GitHub", type: "github", icon: "🐙", description: "Repository management and CI/CD" },
          { name: "Jira", type: "jira", icon: "📋", description: "Issue tracking and project management" },
          { name: "AWS", type: "aws", icon: "☁️", description: "Cloud infrastructure management" },
          { name: "Docker", type: "docker", icon: "🐳", description: "Container orchestration" },
          { name: "Webhook", type: "webhook", icon: "🔗", description: "Custom HTTP endpoints" },
        ].map((integration) => (
          <div key={integration.type} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{integration.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Configure
            </button>
          </div>
        ))}
      </div>

      {/* Configured Integrations */}
      {integrations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configured Integrations</h2>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{integration.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      integration.status === "active" ? "bg-green-100 text-green-800" :
                      integration.status === "error" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {integration.status}
                    </span>
                    <button
                      onClick={() => handleTest(integration._id)}
                      className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
                {integration.testResult && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-sm">
                      Last test: {integration.testResult.success ? "✅" : "❌"} {integration.testResult.message}
                      {integration.testResult.latency && ` (${integration.testResult.latency.toFixed(0)}ms)`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateIntegrationModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

function CreateIntegrationModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "webhook",
    endpoint: "",
    apiKey: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const createIntegration = useMutation(api.integrations.createIntegration);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await createIntegration({
        name: formData.name.trim(),
        type: formData.type,
        configuration: {
          endpoint: formData.endpoint || undefined,
          apiKey: formData.apiKey || undefined,
        },
      });
      toast.success("Integration created successfully!");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create integration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Add Integration</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Integration Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Integration"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="webhook">Webhook</option>
              <option value="slack">Slack</option>
              <option value="github">GitHub</option>
              <option value="jira">Jira</option>
              <option value="aws">AWS</option>
              <option value="docker">Docker</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endpoint URL
            </label>
            <input
              type="url"
              value={formData.endpoint}
              onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
              placeholder="https://api.example.com/webhook"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key (Optional)
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="Enter API key if required"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Integration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
