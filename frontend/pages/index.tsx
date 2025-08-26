import { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Sonomanma App</title>
        <meta name="description" content="Sonomanma application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to Sonomanma</h1>
        <p>This is a Next.js frontend application.</p>
      </main>
    </div>
  )
}

export default Home
