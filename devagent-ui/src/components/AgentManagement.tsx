import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { CreateAgentModal } from "./CreateAgentModal";
import { AgentDetailsModal } from "./AgentDetailsModal";

export function AgentManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Id<"agents"> | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const agents = useQuery(api.agents.listAgents, {
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const deployAgent = useMutation(api.agents.deployAgent);
  const stopAgent = useMutation(api.agents.stopAgent);
  const deleteAgent = useMutation(api.agents.deleteAgent);

  const handleDeploy = async (agentId: Id<"agents">) => {
    try {
      await deployAgent({ agentId });
      toast.success("Agent deployment started");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deploy agent");
    }
  };

  const handleStop = async (agentId: Id<"agents">) => {
    try {
      await stopAgent({ agentId });
      toast.success("Agent stopped");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to stop agent");
    }
  };

  const handleDelete = async (agentId: Id<"agents">) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    
    try {
      await deleteAgent({ agentId });
      toast.success("Agent deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete agent");
    }
  };

  if (!agents) {
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
          <h1 className="text-2xl font-bold text-gray-900">Agent Management</h1>
          <p className="text-gray-600">Deploy and manage your AI agents</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Agent
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="created">Created</option>
          <option value="running">Running</option>
          <option value="stopped">Stopped</option>
          <option value="error">Error</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">All Types</option>
          <option value="dev">Development</option>
          <option value="devops">DevOps</option>
          <option value="qa">QA</option>
          <option value="data_science">Data Science</option>
          <option value="bi">Business Intelligence</option>
          <option value="security">Security</option>
          <option value="documentation">Documentation</option>
        </select>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{agent.type.replace('_', ' ')}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                agent.status === "running" ? "bg-green-100 text-green-800" :
                agent.status === "stopped" ? "bg-gray-100 text-gray-800" :
                agent.status === "error" ? "bg-red-100 text-red-800" :
                agent.status === "starting" ? "bg-blue-100 text-blue-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>
                {agent.status}
              </span>
            </div>

            {agent.configuration.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {agent.configuration.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Executions:</span>
                <span className="font-medium">{agent.metrics?.executionCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Success Rate:</span>
                <span className="font-medium">{agent.metrics?.successRate?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Created by:</span>
                <span className="font-medium">{agent.createdByName}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAgent(agent._id)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Details
              </button>
              
              {agent.status === "running" ? (
                <button
                  onClick={() => handleStop(agent._id)}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Stop
                </button>
              ) : agent.status === "created" || agent.status === "stopped" ? (
                <button
                  onClick={() => handleDeploy(agent._id)}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Deploy
                </button>
              ) : null}

              {agent.status !== "running" && (
                <button
                  onClick={() => handleDelete(agent._id)}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents yet</h3>
          <p className="text-gray-500 mb-4">Create your first AI agent to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Agent
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateAgentModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedAgent && (
        <AgentDetailsModal
          agentId={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
