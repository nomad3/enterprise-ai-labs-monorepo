'use client';

import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface SystemMetrics {
  memory_usage: number;
  cpu_usage: number;
  timestamp: string;
}

interface ApplicationMetrics {
  request_rate: number;
  error_rate: number;
  timestamp: string;
}

interface Alert {
  name: string;
  severity: string;
  status: string;
  description: string;
  start_time: string;
}

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  start_time: string;
  end_time?: string;
  root_cause?: string;
  resolution?: string;
}

export default function DevOps() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [applicationMetrics, setApplicationMetrics] = useState<ApplicationMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [systemRes, appRes, alertsRes, incidentsRes] = await Promise.all([
          fetch('/api/devops/metrics/system'),
          fetch('/api/devops/metrics/application'),
          fetch('/api/devops/alerts'),
          fetch('/api/devops/incidents'),
        ]);

        const systemData = await systemRes.json();
        const appData = await appRes.json();
        const alertsData = await alertsRes.json();
        const incidentsData = await incidentsRes.json();

        setSystemMetrics(prev => [...prev, systemData].slice(-20));
        setApplicationMetrics(prev => [...prev, appData].slice(-20));
        setAlerts(alertsData);
        setIncidents(incidentsData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch DevOps data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">DevOps Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={systemMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="cpu_usage" stroke="#8884d8" name="CPU Usage (%)" />
                    <Line type="monotone" dataKey="memory_usage" stroke="#82ca9d" name="Memory Usage (bytes)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Application Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applicationMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="request_rate" stroke="#8884d8" name="Request Rate" />
                    <Line type="monotone" dataKey="error_rate" stroke="#ff7300" name="Error Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.map((alert) => (
            <Alert key={alert.name} className={getSeverityColor(alert.severity)}>
              <AlertTitle>{alert.name}</AlertTitle>
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <span>{alert.description}</span>
                  <Badge variant="outline">{alert.status}</Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{incident.title}</CardTitle>
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {incident.status}</p>
                  <p><strong>Start Time:</strong> {new Date(incident.start_time).toLocaleString()}</p>
                  {incident.end_time && (
                    <p><strong>End Time:</strong> {new Date(incident.end_time).toLocaleString()}</p>
                  )}
                  {incident.root_cause && (
                    <p><strong>Root Cause:</strong> {incident.root_cause}</p>
                  )}
                  {incident.resolution && (
                    <p><strong>Resolution:</strong> {incident.resolution}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
} 