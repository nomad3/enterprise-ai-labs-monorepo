import React from 'react';
import { Users, Settings, Shield, Activity, Plus, MoreVertical, Building2, Key } from 'lucide-react';

export default function TenantManagement() {
  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-200">Tenant Management</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Tenant
        </button>
      </div>

      {/* Tenant Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Tenant Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">Total Tenants</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">12</div>
            <div className="text-blue-100/80 text-sm">+2 this month</div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">Active Users</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">1,234</div>
            <div className="text-blue-100/80 text-sm">Across all tenants</div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-200">Compliance</h3>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-2">100%</div>
            <div className="text-blue-100/80 text-sm">All tenants compliant</div>
          </div>
        </div>
      </section>

      {/* Tenant List */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6" />
          Tenant List
        </h2>
        <div className="bg-blue-900 rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-blue-200">Tenant Name</th>
                <th className="text-left p-4 text-blue-200">Status</th>
                <th className="text-left p-4 text-blue-200">Users</th>
                <th className="text-left p-4 text-blue-200">Resources</th>
                <th className="text-left p-4 text-blue-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 text-blue-100">Acme Corp</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Active</span>
                </td>
                <td className="p-4 text-blue-100">245</td>
                <td className="p-4 text-blue-100">4 CPU, 8GB RAM</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 text-blue-100">TechStart Inc</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Active</span>
                </td>
                <td className="p-4 text-blue-100">89</td>
                <td className="p-4 text-blue-100">2 CPU, 4GB RAM</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-blue-300 hover:text-blue-100 transition">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Resource Quotas */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Resource Quotas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Default Quotas</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-100">CPU Cores</span>
                  <span className="text-blue-300">2 cores</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-100">Memory</span>
                  <span className="text-blue-300">4GB</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-100">Storage</span>
                  <span className="text-blue-300">50GB</span>
                </div>
                <div className="w-full bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Access Control</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Admin Users</span>
                <span className="text-blue-300">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Regular Users</span>
                <span className="text-blue-300">240</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">API Keys</span>
                <span className="text-blue-300">12</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Manage Access
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* API Access */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Key className="w-6 h-6" />
          API Access
        </h2>
        <div className="bg-blue-900 rounded-xl p-6 border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-blue-200">API Keys</h3>
            <button className="px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
              Generate New Key
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-800/50 rounded-lg">
              <div>
                <div className="text-blue-200 font-medium">Production API Key</div>
                <div className="text-blue-100/80 text-sm">Created 30 days ago</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 transition">
                  View
                </button>
                <button className="px-3 py-1 bg-red-900 text-red-100 rounded hover:bg-red-800 transition">
                  Revoke
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-800/50 rounded-lg">
              <div>
                <div className="text-blue-200 font-medium">Development API Key</div>
                <div className="text-blue-100/80 text-sm">Created 15 days ago</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-700 text-blue-100 rounded hover:bg-blue-600 transition">
                  View
                </button>
                <button className="px-3 py-1 bg-red-900 text-red-100 rounded hover:bg-red-800 transition">
                  Revoke
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 