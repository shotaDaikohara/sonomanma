<<<<<<< HEAD
import { useState, useEffect } from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

interface BackendStatus {
  status: string
  timestamp?: string
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkBackendHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/health')
      if (response.ok) {
        const data = await response.json()
        setBackendStatus({ ...data, timestamp: new Date().toLocaleTimeString() })
      } else {
        setError('Backend health check failed')
      }
    } catch (err) {
      setError('Cannot connect to backend')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 初回起動時にバックエンドの状態をチェック
    checkBackendHealth()
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Sonomanma App</title>
        <meta name="description" content="Sonomanma full-stack application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>Sonomanma</span>
        </h1>
        
        <p className={styles.description}>
          This is a full-stack Next.js + FastAPI application
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Frontend Status &rarr;</h2>
            <p>Next.js 14.2.32 running on port 3000</p>
            <div className={styles.status}>
              <span className={styles.statusLabel}>Status:</span>
              <span className={styles.statusValue}>🟢 Running</span>
            </div>
          </div>

          <div className={styles.card}>
            <h2>Backend Status &rarr;</h2>
            <p>FastAPI running on port 8000</p>
            <div className={styles.status}>
              <span className={styles.statusLabel}>Status:</span>
              {loading ? (
                <span className={styles.statusValue}>⏳ Checking...</span>
              ) : error ? (
                <span className={styles.statusValue}>🔴 Error</span>
              ) : backendStatus ? (
                <span className={styles.statusValue}>🟢 {backendStatus.status}</span>
              ) : (
                <span className={styles.statusValue}>⚪ Unknown</span>
              )}
            </div>
            {backendStatus?.timestamp && (
              <p className={styles.timestamp}>Last checked: {backendStatus.timestamp}</p>
            )}
            {error && <p className={styles.error}>{error}</p>}
            <button 
              className={styles.button}
              onClick={checkBackendHealth}
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Health'}
            </button>
          </div>

          <div className={styles.card}>
            <h2>Features &rarr;</h2>
            <p>Discover what this app can do</p>
            <ul className={styles.featureList}>
              <li>✅ Next.js 14 with TypeScript</li>
              <li>✅ FastAPI backend</li>
              <li>✅ Docker containerization</li>
              <li>✅ Real-time health monitoring</li>
            </ul>
          </div>

          <div className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Find in-depth information about Next.js and FastAPI</p>
            <div className={styles.links}>
              <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                Next.js Documentation →
              </a>
              <a href="https://fastapi.tiangolo.com/" target="_blank" rel="noopener noreferrer">
                FastAPI Documentation →
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <img src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
=======
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
>>>>>>> origin/feat/daikohara
}
