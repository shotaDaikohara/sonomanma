import api from './api';
import { Booking, Message } from '@/types';

export interface BookingRequest {
  host_id: number;
  check_in_date: string;
  check_out_date: string;
  guest_count: number;
  message?: string;
}

export const bookingsApi = {
  // 予約申し込み
  createBooking: async (data: BookingRequest): Promise<Booking> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  // 予約詳細取得
  getBooking: async (bookingId: number): Promise<Booking> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // 予約承認（宿主用）
  approveBooking: async (bookingId: number): Promise<Booking> => {
    const response = await api.post(`/bookings/${bookingId}/approve`);
    return response.data;
  },

  // 予約拒否（宿主用）
  rejectBooking: async (bookingId: number, reason?: string): Promise<Booking> => {
    const response = await api.post(`/bookings/${bookingId}/reject`, { reason });
    return response.data;
  },

  // 予約キャンセル
  cancelBooking: async (bookingId: number, reason?: string): Promise<Booking> => {
    const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },
};

export const messagesApi = {
  // メッセージ一覧取得
  getMessages: async (receiverId?: number, bookingId?: number): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (receiverId) params.append('receiver_id', receiverId.toString());
    if (bookingId) params.append('booking_id', bookingId.toString());
    
    const response = await api.get(`/messages?${params.toString()}`);
    return response.data;
  },

  // メッセージ送信
  sendMessage: async (data: {
    receiver_id: number;
    content: string;
    booking_id?: number;
  }): Promise<Message> => {
    const response = await api.post('/messages', data);
    return response.data;
  },

  // メッセージを既読にする
  markAsRead: async (messageId: number): Promise<void> => {
    await api.post(`/messages/${messageId}/read`);
  },

  // 会話一覧取得
  getConversations: async (): Promise<{
    user: any;
    last_message: Message;
    unread_count: number;
  }[]> => {
    const response = await api.get('/messages/conversations');
    return response.data;
  },
};