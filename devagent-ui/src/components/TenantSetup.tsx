import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export function TenantSetup() {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;

    setIsLoading(true);
    try {
      const token = "your_jwt_token"; // Replace with your actual auth token
      const headers = { Authorization: `Bearer ${token}` };
      const tenantData = {
        name: name.trim(),
        slug: domain.trim().toLowerCase(), // The API uses 'slug' for the domain
        description: "New tenant created from setup.",
        subscription_tier: "trial",
      };

      await axios.post("/api/v1/tenants", tenantData, { headers });

      toast.success("Organization created successfully!");
      // You might want to refresh user data or redirect here
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Set Up Your Organization
          </h1>
          <p className="text-gray-600">
            Create your organization to start managing AI agents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Acme Corporation"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
              required
            />
          </div>

          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="acme-corp"
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow"
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Only lowercase letters, numbers, and hyphens. This will be your unique identifier.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || !domain.trim()}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Organization"}
          </button>
        </form>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Trial Plan Includes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Up to 5 AI agents</li>
            <li>• Basic agent types (Dev, QA, Documentation)</li>
            <li>• 1,000 monthly executions</li>
            <li>• Basic integrations</li>
            <li>• Community support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
