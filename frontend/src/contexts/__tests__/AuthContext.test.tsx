import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../AuthContext';
import { authApi } from '@/lib/auth';

// Mock the auth API
jest.mock('@/lib/auth', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
  },
  getStoredTokens: jest.fn(),
  storeTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

// Mock router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const TestComponent = () => {
  const { user, loading, isAuthenticated, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? user.username : 'null'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('provides initial loading state', () => {
    renderWithProviders(<TestComponent />);
    
    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });

  it('handles successful login', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    const mockAuthResponse = {
      access_token: 'token',
      refresh_token: 'refresh',
      user: mockUser,
    };

    (authApi.login as jest.Mock).mockResolvedValue(mockAuthResponse);

    renderWithProviders(<TestComponent />);
    
    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('handles login error', async () => {
    const mockError = {
      response: {
        data: {
          detail: 'Invalid credentials',
        },
      },
    };

    (authApi.login as jest.Mock).mockRejectedValue(mockError);

    renderWithProviders(<TestComponent />);
    
    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
    });
  });

  it('handles logout', () => {
    renderWithProviders(<TestComponent />);
    
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('null');
  });
});