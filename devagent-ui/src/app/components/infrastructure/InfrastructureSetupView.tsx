import React from 'react';
import { InfrastructureSetup } from '../services/devAgentService';
import './InfrastructureSetupView.css';

interface InfrastructureSetupViewProps {
  setup: InfrastructureSetup;
}

const InfrastructureSetupView: React.FC<InfrastructureSetupViewProps> = ({ setup }) => {
  return (
    <div className="infrastructure-setup">
      <h3>Infrastructure Setup</h3>
      
      <div className="setup-status">
        <span className={`status-badge ${setup.status.toLowerCase()}`}>
          {setup.status}
        </span>
      </div>

      <div className="resources-list">
        <h4>Resources</h4>
        {setup.resources.map((resource, index) => (
          <div key={index} className="resource-item">
            <div className="resource-header">
              <span className="resource-type">{resource.type}</span>
              <span className="resource-name">{resource.name}</span>
            </div>
            <div className="resource-config">
              <h5>Configuration</h5>
              <pre>
                {JSON.stringify(resource.configuration, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfrastructureSetupView; 