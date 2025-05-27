import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Zap,
  BarChart3,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '../../contexts/TenantContext';

interface Agent {
  agent_id: number;
  name: string;
  type: string;
  status: string;
  is_active: boolean;
  is_healthy: boolean;
  current_tasks: number;
  max_concurrent_tasks: number;
  cpu_usage: number;
  memory_usage: number;
  average_task_duration: number;
  last_health_check: string;
  success_rate: number;
}

interface OrchestrationMetrics {
  tenant_id: number;
  agents: {
    total: number;
    active: number;
    healthy: number;
    utilization_percent: number;
  };
  tasks: {
    queued: number;
    running: number;
    queue_breakdown: {
      critical: number;
      high: number;
      normal: number;
      low: number;
    };
  };
  capacity: {
    current_tasks: number;
    max_tasks: number;
    available_capacity: number;
  };
  timestamp: string;
}

interface Task {
  task_id: string;
  status: string;
  assigned_agent_id?: number;
  created_at: string;
  started_at?: string;
  progress?: number;
  queue_position?: number;
}

export default function AgentOrchestration() {
  const { tenant } = useTenant();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<OrchestrationMetrics | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch agents
      const agentsResponse = await fetch('/api/v1/orchestration/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents || []);
      }

      // Fetch metrics
      const metricsResponse = await fetch('/api/v1/orchestration/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch orchestration data');
      console.error('Error fetching orchestration data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [tenant.id]);

  const handleAgentAction = async (agentId: number, action: 'pause' | 'resume' | 'scale') => {
    try {
      let endpoint = `/api/v1/orchestration/agents/${agentId}/${action}`;
      let method = 'POST';
      let body = {};

      if (action === 'scale') {
        const newCapacity = prompt('Enter new max concurrent tasks (1-100):');
        if (!newCapacity || isNaN(Number(newCapacity))) return;
        body = { max_concurrent_tasks: Number(newCapacity) };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchData(); // Refresh data
      } else {
        throw new Error(`Failed to ${action} agent`);
      }
    } catch (err) {
      setError(`Failed to ${action} agent`);
      console.error(`Error ${action}ing agent:`, err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'idle': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Loading orchestration data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Orchestration</h1>
          <p className="text-slate-600 mt-1">Manage and monitor your AI agents</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Deploy Agent
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.agents.total}</div>
              <p className="text-xs text-slate-600">
                {metrics.agents.active} active, {metrics.agents.healthy} healthy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Task Queue</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.tasks.queued}</div>
              <p className="text-xs text-slate-600">
                {metrics.tasks.running} running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.agents.utilization_percent.toFixed(1)}%</div>
              <p className="text-xs text-slate-600">
                {metrics.capacity.current_tasks}/{metrics.capacity.max_tasks} capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Capacity</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.capacity.available_capacity}</div>
              <p className="text-xs text-slate-600">
                tasks can be queued
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task Queue Breakdown */}
      {metrics && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Task Queue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.tasks.queue_breakdown).map(([priority, count]) => (
                <div key={priority} className="text-center">
                  <div className={`w-full h-2 rounded-full mb-2 ${getPriorityColor(priority)}`}></div>
                  <div className="text-lg font-semibold">{count}</div>
                  <div className="text-sm text-slate-600 capitalize">{priority}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Agents ({agents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div 
                key={agent.agent_id} 
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedAgent(selectedAgent?.agent_id === agent.agent_id ? null : agent)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(agent.is_healthy)}
                      <div>
                        <h3 className="font-semibold text-slate-900">{agent.name}</h3>
                        <p className="text-sm text-slate-600">{agent.type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{agent.current_tasks}/{agent.max_concurrent_tasks}</div>
                      <div className="text-xs text-slate-600">Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold">{agent.success_rate.toFixed(1)}%</div>
                      <div className="text-xs text-slate-600">Success</div>
                    </div>
                    <div className="flex gap-2">
                      {agent.status === 'paused' ? (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.agent_id, 'resume');
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgentAction(agent.agent_id, 'pause');
                          }}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentAction(agent.agent_id, 'scale');
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Agent Details */}
                {selectedAgent?.agent_id === agent.agent_id && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-slate-600">CPU Usage</div>
                        <div className="text-lg font-semibold">{agent.cpu_usage.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Memory Usage</div>
                        <div className="text-lg font-semibold">{agent.memory_usage.toFixed(0)} MB</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Avg Duration</div>
                        <div className="text-lg font-semibold">{agent.average_task_duration.toFixed(1)}s</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Last Health Check</div>
                        <div className="text-lg font-semibold">
                          {new Date(agent.last_health_check).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {agents.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Agents Deployed</h3>
                <p className="text-slate-600 mb-4">Deploy your first agent to start orchestrating tasks.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Deploy Agent
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 