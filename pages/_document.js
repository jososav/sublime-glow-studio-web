import Script from "next/script";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Merienda:wght@300..900&display=swap"
          rel="stylesheet"
        />
        <title>Sublime Glow Studio | Manicura y Pedicura Profesional</title>
        <meta
          name="description"
          content="Sublime Glow Studio ofrece los mejores servicios de manicure y pedicure en un ambiente relajante. Reserva tu cita y luce uñas perfectas."
        />
        <meta
          name="keywords"
          content="manicure, pedicure, uñas, nails, salón de uñas, esmaltado, nail art, spa de uñas, uñas acrílicas, cuidado de uñas, belleza de manos y pies"
        />

        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-F5FWYBYZRT"
        ></script>

        <Script id="analytics-init" strategy="afterInteractive">
          {`
          // Initialize Google Analytics
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-F5FWYBYZRT', {
            page_path: window.location.pathname,
          });

          // Wait for Mixpanel to be ready
          function initMixpanel() {
            if (window.mixpanel && window.mixpanel.__loaded) {
              // Get or create anonymous ID for new users
              let anonymousId = localStorage.getItem('mp_anonymous_id');
              if (!anonymousId) {
                anonymousId = 'anon_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('mp_anonymous_id', anonymousId);
                window.mixpanel.identify(anonymousId);
              }
            } else {
              // If Mixpanel isn't ready yet, try again in 100ms
              setTimeout(initMixpanel, 100);
            }
          }

          // Start checking for Mixpanel
          initMixpanel();
        `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
