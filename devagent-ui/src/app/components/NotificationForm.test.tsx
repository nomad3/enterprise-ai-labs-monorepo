import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationForm from './NotificationForm';

describe('NotificationForm', () => {
  it('handles user input and submission correctly', () => {
    const onSendNotification = jest.fn();
    render(<NotificationForm onSendNotification={onSendNotification} />);

    const input = screen.getByPlaceholderText('Enter your notification message');
    const button = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test notification' } });
    fireEvent.click(button);

    expect(onSendNotification).toHaveBeenCalledWith('Test notification');
    expect(input).toHaveValue('');
  });
}); 