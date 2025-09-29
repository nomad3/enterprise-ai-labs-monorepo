import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider } from './app/contexts/AuthContext';
import { TenantProvider } from './app/contexts/TenantContext';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignInForm } from './components/SignInForm';
import { TenantSettings } from './components/TenantSettings';
import { TenantSetup } from './components/TenantSetup';
import { UserManagement } from './components/UserManagement';

// Enterprise pages (ported from Next.js-style pages)
import AgentsPage from './app/enterprise/agents/page';
import MonitoringPage from './app/enterprise/monitoring/page';
import SettingsPage from './app/enterprise/settings/page';
import TenantsPage from './app/enterprise/tenants/page';

function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <Router>
          <Routes>
            {/* Root landing page */}
            <Route path="/" element={<LandingPage />} />

            <Route path="/signin" element={<SignInForm />} />
            <Route path="/setup" element={<TenantSetup />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><TenantSettings /></ProtectedRoute>} />

            {/* Enterprise routes */}
            <Route path="/enterprise/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
            <Route path="/enterprise/monitoring" element={<ProtectedRoute><MonitoringPage /></ProtectedRoute>} />
            <Route path="/enterprise/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/enterprise/tenants" element={<ProtectedRoute><TenantsPage /></ProtectedRoute>} />
          </Routes>
        </Router>
      </TenantProvider>
    </AuthProvider>
  );
}

export default App;
