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
}
