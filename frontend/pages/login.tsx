import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      // エラーはAuthContextで処理される
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>ログイン - StayConnect</title>
        <meta name="description" content="StayConnectにログインして、興味関心でつながる宿泊体験を始めましょう。" />
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
                アカウントにログイン
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                まだアカウントをお持ちでない方は{' '}
                <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  新規登録
                </Link>
              </p>
            </div>

            {/* ログインフォーム */}
            <Card>
              <CardHeader>
                <CardTitle>ログイン</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                        パスワードを忘れた方
                      </Link>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    ログイン
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* ソーシャルログイン（将来の拡張用） */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ログインすることで、
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

export default LoginPage;