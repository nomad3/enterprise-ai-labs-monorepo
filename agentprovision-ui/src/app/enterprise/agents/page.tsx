import { Activity, AlertCircle, Cpu, Pause, Play, Plus, Rocket, Settings, Trash2 } from 'lucide-react';

export default function AgentManagement() {
  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-200">Agent Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Deploy New Agent
        </button>
      </div>

      {/* Agent Types Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Agent Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Development Agents</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Full-Stack</span>
                <span className="text-blue-300">4 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">DevOps</span>
                <span className="text-blue-300">2 Active</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Configure
              </button>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Testing Agents</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">QA</span>
                <span className="text-blue-300">3 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Security</span>
                <span className="text-blue-300">2 Active</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Configure
              </button>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Business Agents</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Data Analysis</span>
                <span className="text-blue-300">1 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Documentation</span>
                <span className="text-blue-300">1 Active</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Configure
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Agents */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Active Agents
        </h2>
        <div className="bg-blue-900 rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-blue-200">Agent Name</th>
                <th className="text-left p-4 text-blue-200">Type</th>
                <th className="text-left p-4 text-blue-200">Status</th>
                <th className="text-left p-4 text-blue-200">Resources</th>
                <th className="text-left p-4 text-blue-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 text-blue-100">AgentProvision-01</td>
                <td className="p-4 text-blue-100">Full-Stack</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Running</span>
                </td>
                <td className="p-4 text-blue-100">2 CPU, 4GB RAM</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <Pause className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-300 hover:text-red-100 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 text-blue-100">DevOpsAgent-01</td>
                <td className="p-4 text-blue-100">DevOps</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm">Paused</span>
                </td>
                <td className="p-4 text-blue-100">1 CPU, 2GB RAM</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <Play className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-300 hover:text-red-100 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Resource Allocation */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Cpu className="w-6 h-6" />
          Resource Allocation
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Resource Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-100">CPU Usage</span>
                  <span className="text-blue-300">65%</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-100">Memory Usage</span>
                  <span className="text-blue-300">48%</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '48%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-100">Storage Usage</span>
                  <span className="text-blue-300">32%</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Alerts & Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-900/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-300" />
                <span className="text-yellow-200">High CPU usage on AgentProvision-01</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-900/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-300" />
                <span className="text-blue-200">DevOpsAgent-01 has been paused for 2 hours</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                View All Alerts
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
