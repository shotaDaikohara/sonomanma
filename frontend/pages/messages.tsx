import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { messagesApi } from '@/lib/bookings';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types';
import { Send, MessageCircle, User } from 'lucide-react';

interface MessageFormData {
  content: string;
}

const MessagesPage: React.FC = () => {
  const router = useRouter();
  const { host, booking, user: receiverId } = router.query;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MessageFormData>();

  // 会話一覧取得
  const { data: conversations = [], isLoading: isConversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.getConversations,
  });

  // メッセージ一覧取得
  const { data: messages = [], isLoading: isMessagesLoading, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation, receiverId, booking],
    queryFn: () => messagesApi.getMessages(
      selectedConversation || Number(receiverId) || undefined,
      Number(booking) || undefined
    ),
    enabled: !!(selectedConversation || receiverId || booking),
    refetchInterval: 5000, // 5秒ごとに更新
  });

  // メッセージ送信
  const sendMessageMutation = useMutation({
    mutationFn: (data: { receiver_id: number; content: string; booking_id?: number }) =>
      messagesApi.sendMessage(data),
    onSuccess: () => {
      reset();
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'メッセージの送信に失敗しました';
      toast.error(message);
    },
  });

  // 初期化時の処理
  useEffect(() => {
    if (receiverId && !selectedConversation) {
      setSelectedConversation(Number(receiverId));
    }
  }, [receiverId, selectedConversation]);

  // メッセージが更新されたら最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const onSubmit = (data: MessageFormData) => {
    const targetReceiverId = selectedConversation || Number(receiverId);
    
    if (!targetReceiverId) {
      toast.error('送信先が選択されていません');
      return;
    }

    sendMessageMutation.mutate({
      receiver_id: targetReceiverId,
      content: data.content,
      booking_id: booking ? Number(booking) : undefined,
    });
  };

  const handleConversationSelect = (userId: number) => {
    setSelectedConversation(userId);
    router.push(`/messages?user=${userId}`, undefined, { shallow: true });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };

  const currentReceiver = conversations.find(conv => conv.user.id === selectedConversation);

  return (
    <>
      <Head>
        <title>メッセージ - StayConnect</title>
        <meta name="description" content="宿主とのメッセージのやり取りができます。" />
      </Head>

      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">メッセージ</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* 会話一覧 */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      会話
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isConversationsLoading ? (
                      <div className="p-4">
                        <div className="animate-pulse space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : conversations.length > 0 ? (
                      <div className="divide-y">
                        {conversations.map((conversation) => (
                          <button
                            key={conversation.user.id}
                            onClick={() => handleConversationSelect(conversation.user.id)}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              selectedConversation === conversation.user.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                                {conversation.user.profile_image ? (
                                  <img
                                    src={conversation.user.profile_image}
                                    alt={conversation.user.full_name || conversation.user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-gray-900 truncate">
                                    {conversation.user.full_name || conversation.user.username}
                                  </h3>
                                  {conversation.unread_count > 0 && (
                                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                      {conversation.unread_count}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.last_message.content}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatMessageTime(conversation.last_message.created_at)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">まだメッセージがありません</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* メッセージ表示エリア */}
              <div className="lg:col-span-2">
                <Card className="h-full flex flex-col">
                  {selectedConversation || receiverId ? (
                    <>
                      {/* ヘッダー */}
                      <CardHeader className="border-b">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                            {currentReceiver?.user.profile_image ? (
                              <img
                                src={currentReceiver.user.profile_image}
                                alt={currentReceiver.user.full_name || currentReceiver.user.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {currentReceiver?.user.full_name || currentReceiver?.user.username || 'ユーザー'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              @{currentReceiver?.user.username || 'user'}
                            </p>
                          </div>
                        </div>
                      </CardHeader>

                      {/* メッセージ一覧 */}
                      <CardContent className="flex-1 overflow-y-auto p-4">
                        {isMessagesLoading ? (
                          <div className="animate-pulse space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-xs">
                                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : messages.length > 0 ? (
                          <div className="space-y-4">
                            {messages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${
                                  message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender_id === user?.id
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      message.sender_id === user?.id
                                        ? 'text-blue-100'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {formatMessageTime(message.created_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">メッセージを送信して会話を始めましょう</p>
                            </div>
                          </div>
                        )}
                      </CardContent>

                      {/* メッセージ入力フォーム */}
                      <div className="border-t p-4">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="メッセージを入力..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            {...register('content', {
                              required: 'メッセージを入力してください',
                            })}
                          />
                          <Button
                            type="submit"
                            loading={sendMessageMutation.isPending}
                            disabled={sendMessageMutation.isPending}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </form>
                        {errors.content && (
                          <p className="text-sm text-red-600 mt-1">{errors.content.message}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <CardContent className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          会話を選択してください
                        </h3>
                        <p className="text-gray-600">
                          左側の会話一覧から、メッセージを送りたい相手を選択してください
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default MessagesPage;