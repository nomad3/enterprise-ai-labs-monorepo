import { useState } from "react";
import { SignInForm } from "./SignInForm";

export function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      // In a real app, you'd send this to your email service
      console.log("Demo request:", email);
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Enterprise AI Agent
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Deploy, manage, and orchestrate AI agents at enterprise scale.
              Reduce operational costs by 60% while increasing productivity across your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button
                onClick={() => setShowSignIn(true)}
                className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-lg hover:border-gray-400 transition-colors">
                Schedule Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-sm text-gray-500">Trusted by 500+ enterprises</div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">●</span>
                <span className="text-sm text-gray-500">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">●</span>
                <span className="text-sm text-gray-500">99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Enterprise AI Challenge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Organizations struggle to deploy AI at scale due to complexity, security concerns, and lack of proper governance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fragmented AI Tools</h3>
              <p className="text-gray-600">
                Teams use disparate AI solutions without centralized management, leading to security risks and inefficiencies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">💸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Escalating Costs</h3>
              <p className="text-gray-600">
                Uncontrolled AI spending and redundant implementations drain budgets without clear ROI visibility.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Compliance Gaps</h3>
              <p className="text-gray-600">
                Lack of proper governance and audit trails creates compliance risks in regulated industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              One Platform. Complete Control.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AgentProvision provides enterprise-grade AI agent management with security, compliance, and cost optimization built-in.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600">🏢</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Tenant Architecture</h3>
                    <p className="text-gray-600">Secure isolation for different departments and teams with granular access controls.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600">📊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Analytics</h3>
                    <p className="text-gray-600">Monitor performance, costs, and usage across all AI agents with comprehensive dashboards.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600">🔐</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                    <p className="text-gray-600">SOC 2 compliant with audit trails, role-based access, and data encryption.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Rapid Deployment</h3>
                    <p className="text-gray-600">Deploy AI agents in minutes, not months, with pre-built templates and integrations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">AgentProvision Dashboard</h4>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Active Agents</span>
                    <span className="font-semibold text-blue-600">24/30</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Monthly Savings</span>
                    <span className="font-semibold text-green-600">$45,000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="font-semibold text-purple-600">98.7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to deploy, manage, and scale AI agents across your organization.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Agent Lifecycle Management</h3>
              <p className="text-gray-600 mb-4">
                Create, deploy, monitor, and retire AI agents with full lifecycle management and version control.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Automated deployment pipelines</li>
                <li>• Version control and rollbacks</li>
                <li>• Health monitoring and alerts</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 mb-4">
                Role-based access control with team workspaces and collaborative agent development.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Granular permissions</li>
                <li>• Team workspaces</li>
                <li>• Collaborative editing</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Integrations</h3>
              <p className="text-gray-600 mb-4">
                Connect with your existing tools and systems through pre-built integrations and APIs.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Slack, Teams, Jira integration</li>
                <li>• REST API and webhooks</li>
                <li>• SSO and LDAP support</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive insights into agent performance, costs, and business impact.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Real-time dashboards</li>
                <li>• Cost optimization insights</li>
                <li>• Performance benchmarking</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security & Compliance</h3>
              <p className="text-gray-600 mb-4">
                Enterprise-grade security with compliance frameworks and audit capabilities.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• SOC 2 Type II certified</li>
                <li>• GDPR and HIPAA compliant</li>
                <li>• Complete audit trails</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Auto-Scaling</h3>
              <p className="text-gray-600 mb-4">
                Automatically scale agent resources based on demand with intelligent load balancing.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Dynamic resource allocation</li>
                <li>• Load balancing</li>
                <li>• Cost optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Proven Enterprise Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Organizations using AgentProvision see immediate impact on their bottom line and operational efficiency.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">60%</div>
              <div className="text-gray-600">Cost Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">10x</div>
              <div className="text-gray-600">Faster Deployment</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">3 Months</div>
              <div className="text-gray-600">Average ROI</div>
            </div>
          </div>

          {/* Case Study */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-sm text-blue-600 font-semibold mb-2">CASE STUDY</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Fortune 500 Financial Services Company
                </h3>
                <p className="text-gray-600 mb-6">
                  "AgentProvision helped us consolidate 15 different AI tools into one platform,
                  reducing our AI infrastructure costs by $2.3M annually while improving security compliance."
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">$2.3M</div>
                    <div className="text-sm text-gray-600">Annual Savings</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">85%</div>
                    <div className="text-sm text-gray-600">Faster Compliance</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Chen</div>
                    <div className="text-sm text-gray-600">CTO, Global Financial Services</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "The platform's multi-tenant architecture and compliance features
                  were exactly what we needed for our regulated environment."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Enterprise Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible pricing that scales with your organization. Start with a free trial.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-white rounded-2xl p-8 border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">Perfect for small teams</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">$99</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Up to 5 AI agents</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Basic analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Standard integrations</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Professional */}
            <div className="bg-white rounded-2xl p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-4">For growing organizations</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">$499</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Up to 50 AI agents</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Advanced analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">All integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">SSO & RBAC</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl p-8 border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">For large organizations</p>
                <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
                <div className="text-gray-600">contact us</div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Unlimited agents</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Custom analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Dedicated support</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">Custom integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-green-500">✓</span>
                  <span className="text-gray-600">On-premise deployment</span>
                </li>
              </ul>
              <button className="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your AI Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ enterprises already using AgentProvision to scale their AI initiatives.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Get Demo
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <div className="text-white">
                <div className="text-2xl mb-2">✅</div>
                <h3 className="text-xl font-semibold mb-2">Demo Requested!</h3>
                <p className="text-blue-100">
                  Our team will contact you within 24 hours to schedule your personalized demo.
                </p>
              </div>
            </div>
          )}

          <p className="text-blue-100 text-sm mt-4">
            No credit card required • 30-day free trial • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AF</span>
                </div>
                <span className="text-xl font-semibold">AgentProvision</span>
              </div>
              <p className="text-gray-400">
                Enterprise AI Agent Platform for modern organizations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2024 AgentProvision. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full relative">
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <SignInForm />
          </div>
        </div>
      )}
    </div>
  );
}
