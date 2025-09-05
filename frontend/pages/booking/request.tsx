import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { hostsApi } from '@/lib/hosts';
import { bookingsApi, BookingRequest } from '@/lib/bookings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, Users, MapPin, Star } from 'lucide-react';

interface BookingFormData {
  message: string;
}

const BookingRequestPage: React.FC = () => {
  const router = useRouter();
  const { hostId, checkIn, checkOut, guests } = router.query;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>();

  const { data: host, isLoading: isHostLoading } = useQuery({
    queryKey: ['host', hostId],
    queryFn: () => hostsApi.getHost(Number(hostId)),
    enabled: !!hostId,
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: BookingRequest) => bookingsApi.createBooking(data),
    onSuccess: (booking) => {
      toast.success('予約申し込みを送信しました');
      router.push(`/bookings/${booking.id}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || '予約申し込みに失敗しました';
      toast.error(message);
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (!hostId || !checkIn || !checkOut || !guests) {
      toast.error('予約情報が不完全です');
      return;
    }

    createBookingMutation.mutate({
      host_id: Number(hostId),
      check_in_date: checkIn as string,
      check_out_date: checkOut as string,
      guest_count: Number(guests),
      message: data.message,
    });
  };

  // 宿泊日数を計算
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 合計金額を計算
  const calculateTotal = () => {
    if (!host?.price_per_night) return 0;
    return host.price_per_night * calculateNights();
  };

  const nights = calculateNights();
  const totalPrice = calculateTotal();

  if (isHostLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse max-w-2xl mx-auto">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!host) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                宿主が見つかりませんでした
              </h3>
              <p className="text-gray-600 mb-6">
                指定された宿主は存在しないか、削除された可能性があります。
              </p>
              <Button onClick={() => router.push('/search')}>
                宿主を探す
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>予約申し込み - {host.title} - StayConnect</title>
        <meta name="description" content={`${host.title}への予約申し込みページです。`} />
      </Head>

      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            {/* ページヘッダー */}
            <div className="flex items-center mb-8">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                戻る
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">予約申し込み</h1>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 宿主情報 */}
              <div>
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {host.photos?.[0] ? (
                          <img
                            src={host.photos[0]}
                            alt={host.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {host.title}
                        </h2>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span className="text-sm">{host.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{host.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500 ml-1">({host.review_count})</span>
                        </div>
                      </div>
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
                            {checkIn ? formatDate(checkIn as string) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium">チェックアウト</p>
                          <p className="text-sm text-gray-600">
                            {checkOut ? formatDate(checkOut as string) : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium">ゲスト数</p>
                        <p className="text-sm text-gray-600">{guests}名</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          {formatCurrency(host.price_per_night || 0)} × {nights}泊
                        </span>
                        <span className="text-sm">
                          {formatCurrency((host.price_per_night || 0) * nights)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>合計</span>
                        <span>{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 申し込みフォーム */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>宿主へのメッセージ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          メッセージ（任意）
                        </label>
                        <textarea
                          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="宿主への挨拶や質問があれば記入してください..."
                          {...register('message')}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          自己紹介や宿泊の目的などを書くと、宿主に良い印象を与えることができます。
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">予約について</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• 予約申し込み後、宿主の承認をお待ちください</li>
                          <li>• 承認されるまで料金は発生しません</li>
                          <li>• 宿主からの返答は通常24時間以内に届きます</li>
                          <li>• メッセージで詳細を相談することができます</li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        loading={createBookingMutation.isPending}
                        disabled={createBookingMutation.isPending}
                      >
                        予約を申し込む
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        申し込みボタンを押すことで、
                        <a href="/terms" className="text-blue-600 hover:underline">利用規約</a>
                        および
                        <a href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</a>
                        に同意したものとみなされます。
                      </p>
                    </form>
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

export default BookingRequestPage;