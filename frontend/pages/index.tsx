import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Search, Home, MessageCircle, Star, Shield, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>StayConnect - 興味関心でつながる宿泊体験</title>
        <meta name="description" content="興味関心でつながる新しい宿泊体験。地元の人との出会いを通じて、旅行をもっと特別なものに。" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        {/* ヒーローセクション */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                興味関心で<br />
                <span className="text-blue-600">つながる</span>宿泊体験
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                同じ趣味や興味を持つ地元の人と出会い、<br />
                ただの宿泊を特別な体験に変えませんか？
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/search">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Search className="w-5 h-5 mr-2" />
                    宿主を探す
                  </Button>
                </Link>
                <Link href="/become-host">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Home className="w-5 h-5 mr-2" />
                    宿主になる
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 特徴セクション */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                StayConnectの特徴
              </h2>
              <p className="text-lg text-gray-600">
                従来の宿泊サービスとは違う、新しい体験をお届けします
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle>興味関心マッチング</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    あなたの趣味や興味に基づいて、相性の良い宿主を見つけることができます。
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle>事前コミュニケーション</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    宿泊前に宿主とメッセージを交換して、お互いを知ることができます。
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6">
                <CardHeader>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle>安心・安全</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    本人確認とレビューシステムで、安心して利用できる環境を提供します。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 使い方セクション */}
        <section className="bg-gray-50 py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                使い方
              </h2>
              <p className="text-lg text-gray-600">
                簡単3ステップで特別な宿泊体験を
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">プロフィール作成</h3>
                <p className="text-gray-600">
                  あなたの興味関心や趣味を登録して、プロフィールを作成します。
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">宿主を探す</h3>
                <p className="text-gray-600">
                  マッチング機能で相性の良い宿主を見つけて、メッセージを送ります。
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">特別な体験</h3>
                <p className="text-gray-600">
                  地元の人との交流を通じて、忘れられない旅の思い出を作ります。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="bg-blue-600 py-20">
          <div className="container">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                今すぐ始めませんか？
              </h2>
              <p className="text-xl mb-8 opacity-90">
                新しい出会いと体験があなたを待っています
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    無料で始める
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600">
                    詳しく見る
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
