import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { bookingsApi } from '@/lib/bookings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  ArrowLeft, Calendar, Users, MapPin, Star, MessageCircle, 
  CheckCircle, XCircle, Clock, AlertCircle 
} from 'lucide-react';

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.getBooking(Number(id)),
    enabled: !!id,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (reason?: string) => bookingsApi.cancelBooking(Number(id), reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      toast.success('予約をキャンセルしました');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || '予約のキャンセルに失敗しました';
      toast.error(message);
    },
  });

  const handleCancelBooking = () => {
    if (window.confirm('本当に予約をキャンセルしますか？')) {
      cancelBookingMutation.mutate();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                予約が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                指定された予約は存在しないか、削除された可能性があります。
              </p>
              <Link href="/bookings">
                <Button>
                  予約一覧に戻る
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>予約詳細 - {booking.host?.title} - StayConnect</title>
        <meta name="description" content={`${booking.host?.title}の予約詳細ページです。`} />
      </Head>

      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            {/* ページヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="mr-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  戻る
                </Button>
                <h1 className="text-3xl font-bold text-gray-900">予約詳細</h1>
              </div>
              
              <div className={`flex items-center px-4 py-2 rounded-full ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                <span className="ml-2 font-medium">{getStatusText(booking.status)}</span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 宿主情報 */}
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>宿泊先情報</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {booking.host?.photos?.[0] ? (
                          <img
                            src={booking.host.photos[0]}
                            alt={booking.host.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {booking.host?.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{booking.host?.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{booking.host?.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500 ml-1">({booking.host?.review_count})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Link href={`/hosts/${booking.host?.id}`}>
                        <Button variant="outline" className="w-full">
                          宿泊先の詳細を見る
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* 予約詳細 */}
                <Card>
                  <CardHeader>
                    <CardTitle>予約詳細</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">チェックイン</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.check_in_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">チェックアウト</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(booking.check_out_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium">ゲスト数</p>
                        <p className="text-sm text-gray-600">{booking.guest_count}名</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">予約ID</span>
                        <span className="text-sm text-gray-600">#{booking.id}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-medium">予約日時</span>
                        <span className="text-sm text-gray-600">
                          {formatDate(booking.created_at)}
                        </span>
                      </div>
                    </div>

                    {booking.total_price && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-semibold text-lg">
                          <span>合計金額</span>
                          <span>{formatCurrency(booking.total_price)}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* アクション・メッセージ */}
              <div>
                {/* メッセージ */}
                {booking.message && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>宿主へのメッセージ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{booking.message}</p>
                    </CardContent>
                  </Card>
                )}

                {/* ステータス別の情報 */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>予約状況</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {booking.status === 'pending' && (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                          <h4 className="font-medium text-yellow-800">承認待ち</h4>
                        </div>
                        <p className="text-yellow-700 text-sm">
                          宿主からの返答をお待ちください。通常24時間以内に返答があります。
                        </p>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <h4 className="font-medium text-green-800">予約確定</h4>
                        </div>
                        <p className="text-green-700 text-sm">
                          予約が確定しました。宿主とメッセージで詳細を相談してください。
                        </p>
                      </div>
                    )}

                    {booking.status === 'cancelled' && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          <h4 className="font-medium text-red-800">キャンセル済み</h4>
                        </div>
                        <p className="text-red-700 text-sm">
                          この予約はキャンセルされました。
                        </p>
                      </div>
                    )}

                    {booking.status === 'completed' && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                          <h4 className="font-medium text-blue-800">宿泊完了</h4>
                        </div>
                        <p className="text-blue-700 text-sm">
                          宿泊が完了しました。レビューを投稿して体験をシェアしませんか？
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* アクションボタン */}
                <Card>
                  <CardHeader>
                    <CardTitle>アクション</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* メッセージボタン */}
                    {booking.host?.user && (
                      <Link href={`/messages?user=${booking.host.user.id}&booking=${booking.id}`}>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          宿主とメッセージ
                        </Button>
                      </Link>
                    )}

                    {/* レビューボタン（完了時のみ） */}
                    {booking.status === 'completed' && (
                      <Link href={`/bookings/${booking.id}/review`}>
                        <Button className="w-full">
                          <Star className="w-4 h-4 mr-2" />
                          レビューを書く
                        </Button>
                      </Link>
                    )}

                    {/* キャンセルボタン（承認待ち・確定時のみ） */}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50"
                        onClick={handleCancelBooking}
                        loading={cancelBookingMutation.isPending}
                        disabled={cancelBookingMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        予約をキャンセル
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default BookingDetailPage;