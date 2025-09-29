import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React from 'react';

export function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const [data, setData] = useState<{ overview: any; currentUser: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/signin');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      try {
        const userResponse = await axios.get("/api/v1/auth/me", { headers });
        const currentUser = userResponse.data;

        if (!currentUser.tenant_id) {
          throw new Error("User is not associated with a tenant.");
        }

        const overviewResponse = await axios.get(`/api/v1/tenants/${currentUser.tenant_id}/overview`, { headers });
        
        setData({ currentUser, overview: overviewResponse.data });
      } catch (err) {
        console.error("Authentication or data fetch failed", err);
        localStorage.removeItem('authToken'); // Clear bad token
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data) {
    // Pass the fetched data as props to the wrapped component (e.g., Dashboard).
    return React.cloneElement(children, { ...data });
  }

  return null; // Or a dedicated error component
} 