import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { hostsApi } from '@/lib/hosts';
import { usersApi } from '@/lib/users';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MapPin, Users, Star, Heart, Calendar, Wifi, Car, Coffee, Tv,
  ArrowLeft, MessageCircle, Share, ChevronLeft, ChevronRight
} from 'lucide-react';

const HostDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);

  const { data: host, isLoading } = useQuery({
    queryKey: ['host', id],
    queryFn: () => hostsApi.getHost(Number(id)),
    enabled: !!id,
  });

  const { data: favoriteHosts = [] } = useQuery({
    queryKey: ['favorite-hosts'],
    queryFn: usersApi.getFavoriteHosts,
    enabled: isAuthenticated,
  });

  const favoriteToggleMutation = useMutation({
    mutationFn: async ({ hostId, isFavorite }: { hostId: number; isFavorite: boolean }) => {
      if (isFavorite) {
        await usersApi.removeFavoriteHost(hostId);
      } else {
        await usersApi.addFavoriteHost(hostId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-hosts'] });
      toast.success('お気に入りを更新しました');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'お気に入りの更新に失敗しました';
      toast.error(message);
    },
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      toast.error('お気に入り機能を使用するにはログインが必要です');
      return;
    }

    if (!host) return;

    const isFavorite = favoriteHosts.some(fav => fav.id === host.id);
    favoriteToggleMutation.mutate({ hostId: host.id, isFavorite });
  };

  const handleBookingRequest = () => {
    if (!isAuthenticated) {
      toast.error('予約するにはログインが必要です');
      router.push('/login');
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error('チェックイン・チェックアウト日を選択してください');
      return;
    }

    // 予約申し込みページに遷移
    router.push({
      pathname: '/booking/request',
      query: {
        hostId: host?.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: guestCount,
      },
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: host?.title,
          text: host?.description,
          url: window.location.href,
        });
      } catch (error) {
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href);
      toast.success('URLをクリップボードにコピーしました');
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
      case 'wi-fi':
        return <Wifi className="w-5 h-5" />;
      case '駐車場':
      case 'parking':
        return <Car className="w-5 h-5" />;
      case 'コーヒー':
      case 'coffee':
        return <Coffee className="w-5 h-5" />;
      case 'テレビ':
      case 'tv':
        return <Tv className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const nextImage = () => {
    if (host?.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % host.photos.length);
    }
  };

  const prevImage = () => {
    if (host?.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + host.photos.length) % host.photos.length);
    }
  };

  const isHostFavorite = host ? favoriteHosts.some(fav => fav.id === host.id) : false;

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
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
              <Link href="/search">
                <Button>
                  宿主を探す
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
        <title>{host.title} - StayConnect</title>
        <meta name="description" content={host.description} />
      </Head>

      <Layout>
        <div className="container py-8">
          {/* ページヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              戻る
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={handleShare}
              >
                <Share className="w-4 h-4 mr-2" />
                シェア
              </Button>
              <Button
                variant="ghost"
                onClick={handleFavoriteToggle}
                className={isHostFavorite ? 'text-red-600' : ''}
              >
                <Heart className={`w-4 h-4 mr-2 ${isHostFavorite ? 'fill-current' : ''}`} />
                {isHostFavorite ? 'お気に入り済み' : 'お気に入り'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2">
              {/* 画像ギャラリー */}
              <div className="relative mb-8">
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                  {host.photos && host.photos.length > 0 ? (
                    <img
                      src={host.photos[currentImageIndex]}
                      alt={host.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">画像なし</span>
                    </div>
                  )}
                </div>

                {/* 画像ナビゲーション */}
                {host.photos && host.photos.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {host.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 基本情報 */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{host.title}</h1>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{host.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="font-medium">{host.rating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({host.review_count}件のレビュー)</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-6">
                  <Users className="w-5 h-5 mr-2" />
                  <span>最大{host.max_guests}名まで宿泊可能</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{host.description}</p>
              </div>

              {/* アメニティ */}
              {host.amenities && host.amenities.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>アメニティ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {host.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          {getAmenityIcon(amenity)}
                          <span className="ml-3">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ハウスルール */}
              {host.house_rules && host.house_rules.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>ハウスルール</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {host.house_rules.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* 宿主情報 */}
              {host.user && (
                <Card>
                  <CardHeader>
                    <CardTitle>宿主について</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        {host.user.profile_image ? (
                          <img
                            src={host.user.profile_image}
                            alt={host.user.full_name || host.user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {host.user.full_name || host.user.username}
                        </h3>
                        <p className="text-gray-600 mb-3">@{host.user.username}</p>
                        {host.user.bio && (
                          <p className="text-gray-700 mb-4">{host.user.bio}</p>
                        )}
                        {host.user.interests && host.user.interests.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">興味関心</h4>
                            <div className="flex flex-wrap gap-2">
                              {host.user.interests.map((interest) => (
                                <span
                                  key={interest}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                >
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 予約サイドバー */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>予約する</CardTitle>
                    {host.price_per_night && (
                      <div className="text-right">
                        <span className="text-2xl font-bold">¥{host.price_per_night.toLocaleString()}</span>
                        <span className="text-gray-600">/泊</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 日程選択 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        チェックイン
                      </label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        チェックアウト
                      </label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* ゲスト数 */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      ゲスト数
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[...Array(host.max_guests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}名
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 宿泊可能期間 */}
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-medium">宿泊可能期間</span>
                    </div>
                    <p>
                      {new Date(host.available_from).toLocaleDateString('ja-JP')} - {new Date(host.available_to).toLocaleDateString('ja-JP')}
                    </p>
                  </div>

                  {/* 予約ボタン */}
                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleBookingRequest}
                    >
                      予約をリクエスト
                    </Button>
                    
                    {isAuthenticated && (
                      <Link href={`/messages?host=${host.id}`}>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          宿主にメッセージ
                        </Button>
                      </Link>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    予約確定前に料金は発生しません
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HostDetailPage;