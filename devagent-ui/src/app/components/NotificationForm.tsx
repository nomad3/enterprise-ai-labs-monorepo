import React, { useState } from 'react';
import './NotificationForm.css';

interface NotificationFormProps {
  onSendNotification: (message: string) => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onSendNotification }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (message.trim()) {
      onSendNotification(message);
      setMessage('');
    }
  };

  return (
    <form className="notification-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your notification message"
        className="notification-input"
      />
      <button type="submit" className="notification-button">Send</button>
    </form>
  );
};

export default NotificationForm; 