import React from 'react';
import './NotificationDisplay.css';

interface NotificationDisplayProps {
  message: string;
}

const NotificationDisplay: React.FC<NotificationDisplayProps> = ({ message }) => {
  return (
    <div className="notification-display">
      <p className="notification-message">{message}</p>
    </div>
  );
};

export default NotificationDisplay; 