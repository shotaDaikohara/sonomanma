import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/users';
import { User, Edit, Calendar, Heart, Settings, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
    enabled: !!user,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: usersApi.getBookings,
    enabled: !!user,
  });

  const { data: favoriteHosts = [] } = useQuery({
    queryKey: ['favorite-hosts'],
    queryFn: usersApi.getFavoriteHosts,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>マイページ - StayConnect</title>
        <meta name="description" content="あなたのプロフィールと予約履歴を確認できます。" />
      </Head>

      <ProtectedRoute>
        <Layout>
          <div className="container py-8">
            {/* ページヘッダー */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">マイページ</h1>
              <Link href="/profile/edit">
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  プロフィール編集
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* プロフィールカード */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <div className="relative mx-auto mb-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {profile?.profile_image ? (
                          <img
                            src={profile.profile_image}
                            alt={profile.full_name || profile.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <CardTitle>{profile?.full_name || profile?.username}</CardTitle>
                    <p className="text-gray-600">@{profile?.username}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">自己紹介</h4>
                        <p className="text-gray-600 text-sm">
                          {profile?.bio || '自己紹介が設定されていません'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">興味関心</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile?.interests?.map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          )) || (
                            <p className="text-gray-500 text-sm">興味関心が設定されていません</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          登録日: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ja-JP') : ''}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* メインコンテンツ */}
              <div className="lg:col-span-2 space-y-6">
                {/* 予約履歴 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        予約履歴
                      </CardTitle>
                      <Link href="/bookings">
                        <Button variant="outline" size="sm">
                          すべて見る
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {bookings.length > 0 ? (
                      <div className="space-y-4">
                        {bookings.slice(0, 3).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{booking.host?.title}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.check_in_date).toLocaleDateString('ja-JP')} - {new Date(booking.check_out_date).toLocaleDateString('ja-JP')}
                              </p>
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status === 'confirmed' ? '確定' :
                                 booking.status === 'pending' ? '承認待ち' :
                                 booking.status === 'cancelled' ? 'キャンセル' :
                                 '完了'}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{booking.guest_count}名</p>
                              {booking.total_price && (
                                <p className="text-sm text-gray-600">¥{booking.total_price.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">まだ予約履歴がありません</p>
                        <Link href="/search">
                          <Button className="mt-4">
                            宿主を探す
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* お気に入り */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Heart className="w-5 h-5 mr-2" />
                        お気に入り
                      </CardTitle>
                      <Link href="/favorites">
                        <Button variant="outline" size="sm">
                          すべて見る
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {favoriteHosts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favoriteHosts.slice(0, 4).map((host) => (
                          <div key={host.id} className="border rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                                {host.photos?.[0] ? (
                                  <img
                                    src={host.photos[0]}
                                    alt={host.title}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{host.title}</h4>
                                <p className="text-sm text-gray-600 truncate">{host.location}</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-yellow-400">★</span>
                                  <span className="text-sm text-gray-600 ml-1">
                                    {host.rating.toFixed(1)} ({host.review_count})
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">まだお気に入りがありません</p>
                        <Link href="/search">
                          <Button className="mt-4">
                            宿主を探す
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 設定 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      設定
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Link href="/profile/edit">
                        <Button variant="outline" className="w-full justify-start">
                          <Edit className="w-4 h-4 mr-2" />
                          プロフィール編集
                        </Button>
                      </Link>
                      <Link href="/settings/notifications">
                        <Button variant="outline" className="w-full justify-start">
                          通知設定
                        </Button>
                      </Link>
                      <Link href="/settings/privacy">
                        <Button variant="outline" className="w-full justify-start">
                          プライバシー設定
                        </Button>
                      </Link>
                    </div>
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

export default ProfilePage;