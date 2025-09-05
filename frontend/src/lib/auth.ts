import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export const authApi = {
  // ユーザー登録
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // ログイン
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    console.log('authApi.login 開始:', data);
    try {
      console.log('axios経由でAPIアクセス開始');
      const response = await api.post('/auth/login', data);
      console.log('axios レスポンス:', response);
      console.log('axios データ:', response.data);
      return response.data;
    } catch (error) {
      console.error('authApi.login エラー:', error);
      throw error;
    }
  },

  // ログアウト
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // 現在のユーザー情報を取得
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // トークンリフレッシュ
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },
};

// ローカルストレージからトークンを取得
export const getStoredTokens = () => {
  if (typeof window === 'undefined') return null;
  
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
};

// トークンをローカルストレージに保存
export const storeTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

// トークンをローカルストレージから削除
export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};