import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SignInForm } from './components/SignInForm';
import { TenantSetup } from './components/TenantSetup';
import { UserManagement } from './components/UserManagement';
import { TenantSettings } from './components/TenantSettings';

// Mock data for development
const mockOverview = {
  tenant: { name: 'Mock Tenant', domain: 'mock.datamatic.app', status: 'active' },
  stats: { activeAgents: 5, totalAgents: 10, totalExecutions: 1500, monthlyCost: 120.50, monthlyTokens: 2500000 },
  agentsByType: { 'crawler': 3, 'writer': 2 },
  recentExecutions: [
    { _id: '1', input: 'Crawl the web', status: 'completed', _creationTime: Date.now() },
    { _id: '2', input: 'Write a blog post', status: 'running', _creationTime: Date.now() },
  ],
};

const mockCurrentUser = {
  name: 'John Doe',
  role: 'Admin',
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard overview={mockOverview} currentUser={mockCurrentUser} />} />
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/setup" element={<TenantSetup />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/settings" element={<TenantSettings overview={mockOverview} />} />
      </Routes>
    </Router>
  );
}

export default App; 