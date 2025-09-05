import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('renders input with label', () => {
    render(<Input label="Email" placeholder="Enter email" />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Email is required" />);
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('displays helper text when no error', () => {
    render(<Input label="Email" helperText="Enter your email address" />);
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
  });

  it('does not display helper text when error is present', () => {
    render(
      <Input 
        label="Email" 
        error="Email is required" 
        helperText="Enter your email address" 
      />
    );
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.queryByText(/enter your email address/i)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password');
  });
});