import api from './api';
import { User, Booking, Host } from '@/types';

export const usersApi = {
  // ユーザープロフィール取得
  getProfile: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // ユーザープロフィール更新
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // ユーザーの予約履歴取得
  getBookings: async (): Promise<Booking[]> => {
    const response = await api.get('/users/me/bookings');
    return response.data;
  },

  // ユーザーのお気に入り宿主取得
  getFavoriteHosts: async (): Promise<Host[]> => {
    const response = await api.get('/users/me/favorites');
    return response.data;
  },

  // 宿主をお気に入りに追加
  addFavoriteHost: async (hostId: number): Promise<void> => {
    await api.post(`/users/me/favorites/${hostId}`);
  },

  // 宿主をお気に入りから削除
  removeFavoriteHost: async (hostId: number): Promise<void> => {
    await api.delete(`/users/me/favorites/${hostId}`);
  },

  // プロフィール画像アップロード
  uploadProfileImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/me/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};