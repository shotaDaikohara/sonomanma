import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/users';
import { User, Camera, ArrowLeft } from 'lucide-react';

const INTEREST_OPTIONS = [
  '旅行', '料理', '音楽', '映画', 'アート', 'スポーツ',
  '読書', '写真', 'ゲーム', 'アニメ', 'ファッション', 'グルメ',
  'アウトドア', 'ヨガ', 'ダンス', 'カラオケ', 'ショッピング', '温泉',
  'カフェ巡り', '神社仏閣', '歴史', '文化', '言語学習', 'ボランティア'
];

interface ProfileFormData {
  username: string;
  full_name: string;
  bio: string;
  interests: string[];
}

const ProfileEditPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: usersApi.getProfile,
    enabled: !!user,
    onSuccess: (data) => {
      setSelectedInterests(data.interests || []);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>();

  React.useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        interests: profile.interests || [],
      });
      setSelectedInterests(profile.interests || []);
    }
  }, [profile, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => usersApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('プロフィールを更新しました');
      router.push('/profile');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'プロフィールの更新に失敗しました';
      toast.error(message);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadProfileImage(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('プロフィール画像を更新しました');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || '画像のアップロードに失敗しました';
      toast.error(message);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      ...data,
      interests: selectedInterests,
    });
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        toast.error('ファイルサイズは5MB以下にしてください');
        return;
      }
      uploadImageMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="max-w-2xl mx-auto">
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
        <title>プロフィール編集 - StayConnect</title>
        <meta name="description" content="あなたのプロフィール情報を編集できます。" />
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
              <h1 className="text-3xl font-bold text-gray-900">プロフィール編集</h1>
            </div>

            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>基本情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* プロフィール画像 */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
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
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer">
                          <Camera className="w-4 h-4" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <h3 className="font-medium">プロフィール画像</h3>
                        <p className="text-sm text-gray-600">
                          JPG、PNG形式で5MB以下のファイルをアップロードしてください
                        </p>
                        {uploadImageMutation.isPending && (
                          <p className="text-sm text-blue-600">アップロード中...</p>
                        )}
                      </div>
                    </div>

                    {/* ユーザー名 */}
                    <Input
                      label="ユーザー名"
                      type="text"
                      placeholder="username"
                      error={errors.username?.message}
                      {...register('username', {
                        required: 'ユーザー名を入力してください',
                        minLength: {
                          value: 3,
                          message: 'ユーザー名は3文字以上で入力してください',
                        },
                      })}
                    />

                    {/* お名前 */}
                    <Input
                      label="お名前"
                      type="text"
                      placeholder="山田 太郎"
                      error={errors.full_name?.message}
                      {...register('full_name', {
                        required: 'お名前を入力してください',
                      })}
                    />

                    {/* 自己紹介 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        自己紹介
                      </label>
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="あなたについて教えてください..."
                        {...register('bio')}
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-600">{errors.bio.message}</p>
                      )}
                    </div>

                    {/* 興味関心 */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-4 block">
                        興味関心（複数選択可）
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {INTEREST_OPTIONS.map((interest) => (
                          <button
                            key={interest}
                            type="button"
                            onClick={() => handleInterestToggle(interest)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              selectedInterests.includes(interest)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {interest}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        選択した興味関心: {selectedInterests.length}個
                      </p>
                    </div>

                    {/* 保存ボタン */}
                    <div className="flex space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push('/profile')}
                      >
                        キャンセル
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        loading={updateProfileMutation.isPending}
                        disabled={updateProfileMutation.isPending}
                      >
                        保存
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    </>
  );
};

export default ProfileEditPage;