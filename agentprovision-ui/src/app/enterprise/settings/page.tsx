import React from 'react';
import { ShieldCheck, BarChart2, Settings, Users, Zap, Cloud, Activity } from 'lucide-react';

export default function EnterpriseSettings() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-blue-200 mb-8">Enterprise Settings</h1>
      
      {/* Security & Compliance Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6" />
          Security & Compliance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Compliance Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">SOC2 Compliance</span>
                <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Compliant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">ISO27001</span>
                <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Compliant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">GDPR</span>
                <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm">In Progress</span>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Security Policies</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Configure Access Policies
              </button>
              <button className="w-full px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Manage API Keys
              </button>
              <button className="w-full px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                View Audit Logs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Management Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Resource Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Compute Resources</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">CPU Usage</span>
                <span className="text-blue-300">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Memory Usage</span>
                <span className="text-blue-300">62%</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Adjust Resources
              </button>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Cost Management</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Monthly Cost</span>
                <span className="text-blue-300">$2,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Cost Trend</span>
                <span className="text-green-300">↓ 12%</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                View Cost Details
              </button>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Quotas & Limits</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">API Calls</span>
                <span className="text-blue-300">45k/100k</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Storage</span>
                <span className="text-blue-300">75GB/100GB</span>
              </div>
              <button className="w-full mt-4 px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Adjust Quotas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Management Section */}
      <section>
        <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Integration Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">Connected Services</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">GitHub</span>
                <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Slack</span>
                <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Jira</span>
                <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm">Pending</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold text-blue-200 mb-4">API Management</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Generate API Key
              </button>
              <button className="w-full px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                Configure Webhooks
              </button>
              <button className="w-full px-4 py-2 bg-blue-800 text-blue-100 rounded-lg hover:bg-blue-700 transition">
                View API Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 