import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/users';
import { Calendar, MapPin, Users, MessageCircle, Star } from 'lucide-react';

const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: usersApi.getBookings,
    enabled: !!user,
  });

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '確定';
      case 'pending':
        return '承認待ち';
      case 'cancelled':
        return 'キャンセル';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>予約管理 - StayConnect</title>
        <meta name="description" content="あなたの予約履歴と現在の予約状況を確認できます。" />
      </Head>

      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            {/* ページヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">予約管理</h1>
              <Link href="/search">
                <Button>
                  新しい宿主を探す
                </Button>
              </Link>
            </div>

            {/* タブナビゲーション */}
            <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {[
                { key: 'all', label: 'すべて' },
                { key: 'pending', label: '承認待ち' },
                { key: 'confirmed', label: '確定' },
                { key: 'completed', label: '完了' },
                { key: 'cancelled', label: 'キャンセル' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {tab.key === 'all' ? bookings.length : bookings.filter(b => b.status === tab.key).length}
                  </span>
                </button>
              ))}
            </div>

            {/* 予約リスト */}
            {filteredBookings.length > 0 ? (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {booking.host?.title}
                              </h3>
                              <div className="flex items-center text-gray-600 mt-1">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span className="text-sm">{booking.host?.location}</span>
                              </div>
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <div>
                                <p className="text-sm font-medium">チェックイン</p>
                                <p className="text-sm">{new Date(booking.check_in_date).toLocaleDateString('ja-JP')}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <div>
                                <p className="text-sm font-medium">チェックアウト</p>
                                <p className="text-sm">{new Date(booking.check_out_date).toLocaleDateString('ja-JP')}</p>
                              </div>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-2" />
                              <div>
                                <p className="text-sm font-medium">ゲスト数</p>
                                <p className="text-sm">{booking.guest_count}名</p>
                              </div>
                            </div>
                          </div>

                          {booking.message && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <p className="text-sm text-gray-700">{booking.message}</p>
                            </div>
                          )}

                          {booking.total_price && (
                            <div className="text-right mb-4">
                              <p className="text-lg font-semibold text-gray-900">
                                ¥{booking.total_price.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:ml-6">
                          {booking.status === 'confirmed' && (
                            <Link href={`/messages?booking=${booking.id}`}>
                              <Button variant="outline" size="sm">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                メッセージ
                              </Button>
                            </Link>
                          )}
                          
                          {booking.status === 'completed' && (
                            <Link href={`/bookings/${booking.id}/review`}>
                              <Button variant="outline" size="sm">
                                <Star className="w-4 h-4 mr-2" />
                                レビュー
                              </Button>
                            </Link>
                          )}

                          <Link href={`/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              詳細
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === 'all' ? '予約履歴がありません' : `${getStatusText(activeTab)}の予約がありません`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    興味関心でつながる宿泊体験を始めませんか？
                  </p>
                  <Link href="/search">
                    <Button>
                      宿主を探す
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default BookingsPage;