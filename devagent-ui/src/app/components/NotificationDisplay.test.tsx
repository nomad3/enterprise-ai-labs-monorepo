import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationDisplay from './NotificationDisplay';

describe('NotificationDisplay', () => {
  it('renders the message correctly', () => {
    const message = 'Test notification message';
    render(<NotificationDisplay message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });
}); 