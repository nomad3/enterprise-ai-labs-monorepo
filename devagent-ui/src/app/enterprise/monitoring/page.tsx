import React from 'react';
import { Activity, AlertCircle, TrendingUp, Clock, Server, Users, Zap, BarChart2 } from 'lucide-react';

export default function MonitoringDashboard() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-blue-200 mb-8">Monitoring Dashboard</h1>

      {/* Key Metrics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Key Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">System Health</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">98.5%</div>
            <div className="text-blue-100/80 text-sm">Uptime last 30 days</div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">Active Users</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">1,234</div>
            <div className="text-blue-100/80 text-sm">+12% from last week</div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">API Requests</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">45.2K</div>
            <div className="text-blue-100/80 text-sm">per minute</div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">Response Time</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">45ms</div>
            <div className="text-blue-100/80 text-sm">average latency</div>
          </div>
        </div>
      </section>

      {/* Performance Analytics */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Performance Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">CPU Usage Trend</h3>
            <div className="h-48 flex items-center justify-center text-blue-300">
              [CPU Usage Chart Placeholder]
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-blue-100/80">Peak Usage</div>
                <div className="text-lg font-semibold text-blue-300">78%</div>
              </div>
              <div>
                <div className="text-sm text-blue-100/80">Average Usage</div>
                <div className="text-lg font-semibold text-blue-300">45%</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Memory Usage Trend</h3>
            <div className="h-48 flex items-center justify-center text-blue-300">
              [Memory Usage Chart Placeholder]
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-blue-100/80">Peak Usage</div>
                <div className="text-lg font-semibold text-blue-300">62%</div>
              </div>
              <div>
                <div className="text-sm text-blue-100/80">Average Usage</div>
                <div className="text-lg font-semibold text-blue-300">48%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alerts & Incidents */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Alerts & Incidents
        </h2>
        <div className="bg-blue-900 rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-blue-200">Time</th>
                <th className="text-left p-4 text-blue-200">Severity</th>
                <th className="text-left p-4 text-blue-200">Alert</th>
                <th className="text-left p-4 text-blue-200">Status</th>
                <th className="text-left p-4 text-blue-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 text-blue-100">2 minutes ago</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm">Critical</span>
                </td>
                <td className="p-4 text-blue-100">High CPU usage on production server</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm">Investigating</span>
                </td>
                <td className="p-4">
                  <button className="px-3 py-1 bg-blue-800 text-blue-100 rounded hover:bg-blue-700 transition">
                    View Details
                  </button>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 text-blue-100">15 minutes ago</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm">Warning</span>
                </td>
                <td className="p-4 text-blue-100">Memory usage approaching threshold</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Resolved</span>
                </td>
                <td className="p-4">
                  <button className="px-3 py-1 bg-blue-800 text-blue-100 rounded hover:bg-blue-700 transition">
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cost Analytics */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <BarChart2 className="w-6 h-6" />
          Cost Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Monthly Cost</h3>
            <div className="text-3xl font-bold text-blue-300 mb-2">$12,450</div>
            <div className="text-blue-100/80 text-sm">-8% from last month</div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Cost by Service</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Compute</span>
                <span className="text-blue-300">$8,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Storage</span>
                <span className="text-blue-300">$2,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Network</span>
                <span className="text-blue-300">$1,800</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Cost Optimization</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-900/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-300" />
                <span className="text-green-200">8% cost reduction achieved</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-900/50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-300" />
                <span className="text-yellow-200">3 optimization opportunities</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                View Recommendations
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 