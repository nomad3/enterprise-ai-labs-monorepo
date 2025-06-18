import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

import { Id } from "../../convex/_generated/dataModel";

interface AgentDetailsModalProps {
  agentId: Id<"agents">;
  onClose: () => void;
}

export function AgentDetailsModal({ agentId, onClose }: AgentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "executions" | "settings">("overview");
  const [executionInput, setExecutionInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  const agent = useQuery(api.agents.getAgent, { agentId });
  const executeAgent = useMutation(api.agents.executeAgent);

  const handleExecute = async () => {
    if (!executionInput.trim() || !agent) return;

    setIsExecuting(true);
    try {
      await executeAgent({
        agentId: agent._id,
        input: executionInput.trim(),
      });
      toast.success("Execution started");
      setExecutionInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to execute agent");
    } finally {
      setIsExecuting(false);
    }
  };

  if (!agent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{agent.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{agent.type.replace('_', ' ')}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                agent.status === "running" ? "bg-green-100 text-green-800" :
                agent.status === "stopped" ? "bg-gray-100 text-gray-800" :
                agent.status === "error" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {agent.status}
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            {["overview", "executions", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Agent Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Agent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="font-medium">{agent.configuration.description || "No description"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Created by</p>
                    <p className="font-medium">{agent.createdByName}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Version</p>
                    <p className="font-medium">{agent.configuration.version}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{new Date(agent._creationTime).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600">Total Executions</p>
                    <p className="text-2xl font-bold text-blue-900">{agent.metrics?.executionCount || 0}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600">Success Rate</p>
                    <p className="text-2xl font-bold text-green-900">{agent.metrics?.successRate?.toFixed(1) || 0}%</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-purple-900">{agent.metrics?.avgResponseTime?.toFixed(0) || 0}ms</p>
                  </div>
                </div>
              </div>

              {/* Configuration */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Configuration</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">LLM Settings</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Model:</span>
                        <span className="ml-2 font-medium">{agent.configuration.llmSettings?.primaryModel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Temperature:</span>
                        <span className="ml-2 font-medium">{agent.configuration.llmSettings?.temperature}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Tokens:</span>
                        <span className="ml-2 font-medium">{agent.configuration.llmSettings?.maxTokens}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resource Allocation</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">CPU:</span>
                        <span className="ml-2 font-medium">{agent.configuration.resources?.cpu} cores</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Memory:</span>
                        <span className="ml-2 font-medium">{agent.configuration.resources?.memory} GB</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Storage:</span>
                        <span className="ml-2 font-medium">{agent.configuration.resources?.storage} GB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execute Agent */}
              {agent.status === "running" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Execute Agent</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <textarea
                      value={executionInput}
                      onChange={(e) => setExecutionInput(e.target.value)}
                      placeholder="Enter your task or question for the agent..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none mb-3"
                    />
                    <button
                      onClick={handleExecute}
                      disabled={isExecuting || !executionInput.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExecuting ? "Executing..." : "Execute"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "executions" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Executions</h3>
              <div className="space-y-4">
                {agent.recentExecutions?.length > 0 ? (
                  agent.recentExecutions.map((execution: any) => (
                    <div key={execution._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          execution.status === "completed" ? "bg-green-100 text-green-800" :
                          execution.status === "failed" ? "bg-red-100 text-red-800" :
                          execution.status === "running" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {execution.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(execution._creationTime).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Input:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                            {execution.input || "No input"}
                          </p>
                        </div>
                        {execution.output && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Output:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
                              {execution.output}
                            </p>
                          </div>
                        )}
                        {execution.error && (
                          <div>
                            <p className="text-sm font-medium text-red-700">Error:</p>
                            <p className="text-sm text-red-600 bg-red-50 rounded p-2">
                              {execution.error}
                            </p>
                          </div>
                        )}
                        {execution.duration && (
                          <p className="text-xs text-gray-500">
                            Duration: {execution.duration}ms
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No executions yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Settings</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Agent configuration editing is coming soon. For now, you can view the current settings in the Overview tab.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
