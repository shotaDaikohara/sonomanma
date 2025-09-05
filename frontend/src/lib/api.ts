import axios from 'axios';

// クライアントサイドではNext.jsのプロキシを使用、サーバーサイドでは直接バックエンドにアクセス
const API_BASE_URL = typeof window !== 'undefined' 
  ? '/api'  // クライアントサイド: Next.jsプロキシを使用
  : process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://backend:8000/api';  // サーバーサイド: 直接バックエンドにアクセス

console.log('API_BASE_URL:', API_BASE_URL);
console.log('typeof window:', typeof window);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒タイムアウト
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター：認証トークンを自動で追加
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター：エラーハンドリング
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ログインエンドポイントの場合は401リダイレクトを無効にする
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginRequest) {
      // 認証エラーの場合、トークンを削除してログインページにリダイレクト
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;