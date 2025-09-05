import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from '@/types';
import { authApi, getStoredTokens, storeTokens, clearTokens } from '@/lib/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; interests?: string[] }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初期化時にトークンをチェック
  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens();
      if (tokens) {
        // トークンが存在する場合は、ユーザー情報をローカルストレージから復元するか
        // 簡易的にダミーユーザーを設定（後で適切な実装に変更）
        // 現在は、ログイン成功時にユーザー情報が設定されるので、ここでは何もしない
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('ログイン開始:', { email });
      const response = await authApi.login({ email, password });
      console.log('ログインレスポンス:', response);
      console.log('レスポンスの型:', typeof response);
      console.log('access_token存在:', !!response.access_token);
      console.log('user存在:', !!response.user);
      
      if (!response.access_token || !response.user) {
        console.error('レスポンス形式が無効:', response);
        throw new Error('Invalid response format');
      }
      
      storeTokens(response.access_token, response.refresh_token);
      setUser(response.user);
      toast.success('ログインしました');
      router.push('/');
    } catch (error: any) {
      console.error('ログインエラー詳細:', {
        error,
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let message = 'ログインに失敗しました';
      if (error.response?.data?.detail) {
        message = error.response.data.detail;
      } else if (error.message) {
        message = error.message;
      } else if (error.code === 'NETWORK_ERROR') {
        message = 'ネットワークエラー';
      }
      
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: { email: string; password: string; name: string; interests?: string[] }) => {
    try {
      const response = await authApi.register(data);
      storeTokens(response.access_token, response.refresh_token);
      setUser(response.user);
      toast.success('アカウントを作成しました');
      router.push('/');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'アカウント作成に失敗しました';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    toast.success('ログアウトしました');
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};