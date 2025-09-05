import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';

describe('Card Components', () => {
  it('renders Card with children', () => {
    render(
      <Card data-testid="card">
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card className="custom-card" data-testid="card" />);
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('renders CardHeader with children', () => {
    render(
      <CardHeader data-testid="card-header">
        <div>Header content</div>
      </CardHeader>
    );
    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders CardTitle with children', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('renders CardContent with children', () => {
    render(
      <CardContent data-testid="card-content">
        <div>Content</div>
      </CardContent>
    );
    expect(screen.getByTestId('card-content')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders complete Card structure', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Test content</p>
        </CardContent>
      </Card>
    );

    expect(screen.getByTestId('complete-card')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});