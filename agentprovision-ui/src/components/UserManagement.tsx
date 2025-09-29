import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

// The Id type from Convex is just a branded string. We can create a simple equivalent.
type Id<T extends string> = string & { __tableName: T };

export function UserManagement() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = "your_jwt_token"; // Replace with a real token
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get("/api/v1/users", { headers });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
        toast.error("Failed to load users.");
      }
    };
    fetchUsers();
  }, []);

  const handleRemoveUser = async (userId: Id<"users">) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    
    try {
      // TODO: Implement actual API call to DELETE /api/v1/users/{userId}
      console.log(`Removing user ${userId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("User removed successfully");
      setUsers(prev => prev.filter(user => user.userId !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove user");
    }
  };

  const handleRoleChange = async (userId: Id<"users">, newRole: string) => {
    try {
      // TODO: Implement actual API call to PATCH /api/v1/users/{userId}/role
      console.log(`Changing role for user ${userId} to ${newRole}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("User role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  if (!users) {
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage team members and permissions</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Invite User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-900">User</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Role</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Status</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Last Active</th>
              <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.userId} className="border-t border-gray-200">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium">
                      {user.name?.[0] || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name || "Unknown User"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.userId, e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="tenant_admin">Tenant Admin</option>
                    <option value="agent_manager">Agent Manager</option>
                    <option value="agent_operator">Agent Operator</option>
                    <option value="agent_viewer">Agent Viewer</option>
                    <option value="integration_manager">Integration Manager</option>
                    <option value="security_manager">Security Manager</option>
                  </select>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-500">
                  {new Date(user._creationTime).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => handleRemoveUser(user.userId)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
          <p className="text-gray-500 mb-4">Invite team members to collaborate</p>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Invite User
          </button>
        </div>
      )}

      {showInviteModal && (
        <InviteUserModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("agent_viewer");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const token = "your_jwt_token";
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post("/api/v1/users/invite", { email: email.trim(), role }, { headers });
      toast.success("User invitation sent");
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Invite User</h2>
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
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="agent_viewer">Agent Viewer</option>
              <option value="agent_operator">Agent Operator</option>
              <option value="agent_manager">Agent Manager</option>
              <option value="integration_manager">Integration Manager</option>
              <option value="security_manager">Security Manager</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
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
              disabled={isLoading || !email.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
