import "../styles/global.css";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AuthenticationProvider } from "../providers/Authentication/authentication";
import Header from "../components/Header/header";
import Footer from "../components/Footer/footer";
import { Toaster } from "react-hot-toast";
import { pageview } from '../config/analytics';
import { trackPageView } from '../config/mixpanel';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Track page views when route changes
    const handleRouteChange = async (url) => {
      // Track in GA4
      pageview(url);
      // Track in Mixpanel
      try {
        await trackPageView(url);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    // Track initial page view
    handleRouteChange(window.location.pathname);

    // Track subsequent route changes
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <AuthenticationProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <Toaster position="top-right" />
    </AuthenticationProvider>
  );
}
