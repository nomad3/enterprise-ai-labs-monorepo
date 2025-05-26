import React, { useState } from 'react';
import TicketIngestionFlow from '../../tickets/TicketIngestionFlow';
import PipelineView from '../../pipeline/PipelineView';
import VersionControlView from '../../version-control/VersionControlView';
import FileBrowser from '../../file-browser/FileBrowser';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tickets');

  const renderContent = () => {
    switch (activeTab) {
      case 'tickets':
        return <TicketIngestionFlow />;
      case 'pipeline':
        return <PipelineView />;
      case 'version-control':
        return <VersionControlView />;
      case 'files':
        return <FileBrowser />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <button
          className={`nav-button ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets
        </button>
        <button
          className={`nav-button ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          CI/CD Pipeline
        </button>
        <button
          className={`nav-button ${activeTab === 'version-control' ? 'active' : ''}`}
          onClick={() => setActiveTab('version-control')}
        >
          Version Control
        </button>
        <button
          className={`nav-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
      </nav>

      <main className="dashboard-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard; 