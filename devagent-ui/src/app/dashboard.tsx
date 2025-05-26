import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-blue-200 mb-8">Enterprise Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        <div className="bg-blue-900 rounded-xl shadow p-6 border border-border">
          <div className="text-blue-400 text-lg font-bold mb-2">Active Tenants</div>
          <div className="text-3xl font-extrabold text-blue-200">3</div>
        </div>
        <div className="bg-blue-900 rounded-xl shadow p-6 border border-border">
          <div className="text-blue-400 text-lg font-bold mb-2">Active Agents</div>
          <div className="text-3xl font-extrabold text-blue-200">12</div>
        </div>
        <div className="bg-blue-900 rounded-xl shadow p-6 border border-border">
          <div className="text-blue-400 text-lg font-bold mb-2">Compliance Status</div>
          <div className="text-3xl font-extrabold text-blue-200">SOC2, ISO27001</div>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-lg bg-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition">Add Tenant</button>
        <button className="px-6 py-3 rounded-lg bg-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition">Deploy Agent</button>
        <button className="px-6 py-3 rounded-lg bg-blue-700 text-white font-bold text-lg shadow-lg hover:bg-blue-800 transition">View Audit Logs</button>
      </div>
    </div>
  );
} 