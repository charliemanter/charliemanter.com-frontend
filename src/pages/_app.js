// pages/_app.js
import '@/styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  useEffect(() => {
    // ensure dataLayer exists
    window.dataLayer = window.dataLayer || []

    const handleRouteChange = (url) => {
      window.dataLayer.push({
        event: 'pageview',
        page: url,
      })
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return <Component {...pageProps} />
}
