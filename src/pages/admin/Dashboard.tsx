import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { LogoManager } from '../../components/admin/LogoManager';
import { UserManagement } from '../../components/admin/UserManagement';
import { PropertyManagement } from '../../components/admin/PropertyManagement';
import { CreditManagement } from '../../components/admin/CreditManagement';
import { InvestorImport } from '../../components/admin/InvestorImport';
import { SyndicatorImport } from '../../components/admin/SyndicatorImport';
import { AnalyticsDashboard } from '../../components/admin/AnalyticsDashboard';
import { ClaimRequests } from '../../components/admin/ClaimRequests';
import { SyndicatorVerificationAdmin } from '../../components/SyndicatorVerificationAdmin';
import { SystemManagement } from '../../components/admin/SystemManagement';
import { DeactivatedAccountsManagement } from '../../components/admin/DeactivatedAccountsManagement';
import { useAuthStore } from '../../lib/store';
import { BarChart, Users, Building2, CreditCard, FileText, Settings, Upload, CheckCircle, Shield, Database, UserX } from 'lucide-react';

export function AdminDashboard() {
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'deactivated' | 'properties' | 'credits' | 'import-investors' | 'import-syndicators' | 'settings' | 'claims' | 'verification' | 'system'>('analytics');

  if (!profile) return (
    <div style={{ padding: '24px', textAlign: 'center' }}>
      <i>Loading... </i>
      <br />
      <br />
      <a href="/">Return to home</a>
    </div>
  )

  if (!profile?.is_admin) {
    return <Navigate to="/" replace />;
  }

  const quickClearCache = async () => {
    if (confirm('Clear browser cache? This will refresh the page.')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        alert('Cache cleared successfully!');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('Error clearing cache. Check console for details.');
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'users':
        return <UserManagement />;
      case 'deactivated':
        return <DeactivatedAccountsManagement />;
      case 'properties':
        return <PropertyManagement />;
      case 'credits':
        return <CreditManagement />;
      case 'import-investors':
        return <InvestorImport />;
      case 'import-syndicators':
        return <SyndicatorImport />;
      case 'settings':
        return <LogoManager />;
      case 'claims':
        return <ClaimRequests />;
      case 'verification':
        return <SyndicatorVerificationAdmin />;
      case 'system':
        return <SystemManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={quickClearCache}
              className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Quick Clear Cache
            </button>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b overflow-x-auto">
          <div className="flex space-x-6 min-w-max">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-4 flex items-center ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart className="h-5 w-5 mr-2" />
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 flex items-center ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-5 w-5 mr-2" />
              Users
            </button>

            {/* <button
              onClick={() => setActiveTab('deactivated')}
              className={`pb-4 flex items-center ${
                activeTab === 'deactivated'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserX className="h-5 w-5 mr-2" />
              Deactivated Users
            </button> */}
            
            <button
              onClick={() => setActiveTab('properties')}
              className={`pb-4 flex items-center ${
                activeTab === 'properties'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building2 className="h-5 w-5 mr-2" />
              Properties
            </button>

            {/* <button
              onClick={() => setActiveTab('credits')}
              className={`pb-4 flex items-center ${
                activeTab === 'credits'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Credits
            </button> */}

            <button
              onClick={() => setActiveTab('claims')}
              className={`pb-4 flex items-center ${
                activeTab === 'claims'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Claim Requests
            </button>

            {/* <button
              onClick={() => setActiveTab('import-investors')}
              className={`pb-4 flex items-center ${
                activeTab === 'import-investors'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Investors
            </button> */}

            {/* <button
              onClick={() => setActiveTab('import-syndicators')}
              className={`pb-4 flex items-center ${
                activeTab === 'import-syndicators'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Syndicators
            </button> */}

            <button
              onClick={() => setActiveTab('verification')}
              className={`pb-4 flex items-center ${
                activeTab === 'verification'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="h-5 w-5 mr-2" />
              Syndicator Verification
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`pb-4 flex items-center ${
                activeTab === 'system'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Database className="h-5 w-5 mr-2" />
              System Management
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 flex items-center ml-auto ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {renderContent()}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AdminDashboard;