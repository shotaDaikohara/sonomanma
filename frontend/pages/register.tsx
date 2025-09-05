import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  full_name: string;
  interests: string[];
}

const INTEREST_OPTIONS = [
  '旅行', '料理', '音楽', '映画', 'アート', 'スポーツ',
  '読書', '写真', 'ゲーム', 'アニメ', 'ファッション', 'グルメ',
  'アウトドア', 'ヨガ', 'ダンス', 'カラオケ', 'ショッピング', '温泉',
  'カフェ巡り', '神社仏閣', '歴史', '文化', '言語学習', 'ボランティア'
];

const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.full_name, // full_nameをnameとして送信
        interests: selectedInterests,
      });
    } catch (error) {
      // エラーはAuthContextで処理される
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = async () => {
    const isValid = await trigger(['email', 'password', 'confirmPassword', 'username', 'full_name']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <>
      <Head>
        <title>新規登録 - StayConnect</title>
        <meta name="description" content="StayConnectに新規登録して、興味関心でつながる宿泊体験を始めましょう。" />
      </Head>

      <Layout showHeader={false} showFooter={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* ロゴ */}
            <div className="text-center">
              <Link href="/" className="inline-flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">S</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">StayConnect</span>
              </Link>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                アカウントを作成
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                すでにアカウントをお持ちの方は{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  ログイン
                </Link>
              </p>
            </div>

            {/* プログレスバー */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>

            {/* 登録フォーム */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentStep === 1 ? '基本情報' : '興味関心'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {currentStep === 1 ? (
                    <>
                      <Input
                        label="メールアドレス"
                        type="email"
                        placeholder="your@email.com"
                        error={errors.email?.message}
                        {...register('email', {
                          required: 'メールアドレスを入力してください',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: '有効なメールアドレスを入力してください',
                          },
                        })}
                      />

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

                      <Input
                        label="お名前"
                        type="text"
                        placeholder="山田 太郎"
                        error={errors.full_name?.message}
                        {...register('full_name', {
                          required: 'お名前を入力してください',
                        })}
                      />

                      <div className="relative">
                        <Input
                          label="パスワード"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="パスワードを入力"
                          error={errors.password?.message}
                          {...register('password', {
                            required: 'パスワードを入力してください',
                            minLength: {
                              value: 6,
                              message: 'パスワードは6文字以上で入力してください',
                            },
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="パスワード（確認）"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="パスワードを再入力"
                          error={errors.confirmPassword?.message}
                          {...register('confirmPassword', {
                            required: 'パスワードを再入力してください',
                            validate: value =>
                              value === password || 'パスワードが一致しません',
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      <Button
                        type="button"
                        className="w-full"
                        onClick={handleNextStep}
                      >
                        次へ
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-4 block">
                          興味関心を選択してください（複数選択可）
                        </label>
                        <div className="grid grid-cols-2 gap-2">
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

                      <div className="flex space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setCurrentStep(1)}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          戻る
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          loading={isLoading}
                          disabled={isLoading}
                        >
                          アカウント作成
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* 利用規約 */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                アカウントを作成することで、
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  利用規約
                </Link>
                と
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  プライバシーポリシー
                </Link>
                に同意したものとみなされます。
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default RegisterPage;