import api from './api';
import { Host } from '@/types';

export interface HostSearchParams {
  location?: string;
  max_guests?: number;
  skip?: number;
  limit?: number;
}

export const hostsApi = {
  // 宿主一覧取得（検索・フィルタリング）
  getHosts: async (params: HostSearchParams = {}): Promise<Host[]> => {
    const searchParams = new URLSearchParams();
    
    if (params.location) searchParams.append('location', params.location);
    if (params.max_guests) searchParams.append('max_guests', params.max_guests.toString());
    if (params.skip) searchParams.append('skip', params.skip.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    
    const url = `/hosts${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    console.log('Making API request to:', url);
    console.log('Full URL will be:', `${api.defaults.baseURL}${url}`);
    const response = await api.get(url);
    console.log('API response:', response);
    return response.data;
  },

  // 宿主詳細取得
  getHostDetail: async (hostId: number): Promise<Host> => {
    const response = await api.get(`/hosts/${hostId}/`);
    return response.data;
  },

  // 宿主情報登録
  createHost: async (hostData: any): Promise<Host> => {
    const response = await api.post('/hosts/', hostData);
    return response.data;
  },

  // 宿主情報更新
  updateHost: async (hostId: number, hostData: any): Promise<Host> => {
    const response = await api.put(`/hosts/${hostId}/`, hostData);
    return response.data;
  },

  // 写真アップロード
  uploadPhotos: async (hostId: number, files: FileList): Promise<any> => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    const response = await api.post(`/hosts/${hostId}/upload-photos/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};