import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Analytics() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const analytics = useQuery(api.analytics.getAnalyticsDashboard, { timeRange });

  if (!analytics) {
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Monitor performance and usage metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.totalExecutions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.successRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.summary.avgResponseTime.toFixed(0)}ms</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-xl">⏱️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">${analytics.summary.totalCost.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Executions by Date */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Executions Over Time</h3>
          <div className="space-y-3">
            {Object.entries(analytics.charts.executionsByDate).map(([date, count]) => (
              <div key={date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(date).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(analytics.charts.executionsByDate))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executions by Agent Type */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Executions by Agent Type</h3>
          <div className="space-y-3">
            {Object.entries(analytics.charts.executionsByAgentType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(analytics.charts.executionsByAgentType))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Agents */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Agents</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Agent</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Executions</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Success Rate</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Response Time</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topAgents.map((agent) => (
                <tr key={agent.agentId} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{agent.name}</td>
                  <td className="py-3 px-4 text-gray-600 capitalize">{agent.type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-gray-600">{agent.executions}</td>
                  <td className="py-3 px-4 text-gray-600">{agent.successRate.toFixed(1)}%</td>
                  <td className="py-3 px-4 text-gray-600">{agent.avgResponseTime.toFixed(0)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
