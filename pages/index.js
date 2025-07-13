import Head from "next/head";
import Image from "next/image";
import ServicesSection from "../components/ServicesSection/servicesSection";
import LocationMap from "../components/LocationMap/locationMap";
import styles from "../styles/Home.module.css";
import Link from "next/link";
import { useAuthentication } from "../providers/Authentication/authentication";

export default function Home() {
  const { user } = useAuthentication();

  return (
    <>
      <Head>
        <title>
          Sublime Glow Studio | Servicios de Belleza y Estética Profesional
        </title>
        <meta
          name="description"
          content="Descubre servicios de belleza profesionales en Sublime Glow Studio. Especialistas en maquillaje, tratamientos faciales, y más. Obtén hasta 100% de descuento en tu primera cita con nuestro programa de referidos."
        />
        <meta
          name="keywords"
          content="salon de belleza, maquillaje profesional, tratamientos faciales, belleza, estética, servicios de belleza, maquillaje, cuidado de la piel, promociones belleza"
        />
        {/* Open Graph */}
        <meta
          property="og:title"
          content="Sublime Glow Studio | Servicios de Belleza y Estética Profesional"
        />
        <meta
          property="og:description"
          content="Tu destino de belleza profesional. Servicios de maquillaje, tratamientos faciales y más. Programa tu cita hoy y descubre nuestras promociones especiales."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sublimeglowstudio.com" />
        <meta property="og:site_name" content="Sublime Glow Studio" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Sublime Glow Studio | Servicios de Belleza y Estética"
        />
        <meta
          name="twitter:description"
          content="Tu destino de belleza profesional. Servicios de maquillaje, tratamientos faciales y más. Programa tu cita hoy."
        />
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Spanish" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Sublime Glow Studio" />
        <link rel="canonical" href="https://sublimeglowstudio.com" />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautySalon",
              name: "Sublime Glow Studio",
              description: "Servicios profesionales de belleza y estética",
              url: "https://sublimeglowstudio.com",
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                addressCountry: "MX",
              },
              offers: {
                "@type": "Offer",
                description:
                  "Programa de referidos con descuentos de hasta 100%",
              },
              potentialAction: {
                "@type": "ReserveAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://sublimeglowstudio.com/reservar",
                  actionPlatform: [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/IOSPlatform",
                    "http://schema.org/AndroidPlatform",
                  ],
                },
                result: {
                  "@type": "Reservation",
                  name: "Reserva de cita",
                },
              },
            }),
          }}
        />
      </Head>
      <main className={styles.main}>
        <section className={styles.wrapper}>
          <div className={styles.heroSection}>
            <h1 className={styles.title}>Sublime Glow Studio</h1>
            <h2 className={styles.subtitle}>
              Realza la belleza de tus manos y pies
            </h2>
            <p className={styles.description}>
              Las uñas se moldean, las cutículas se cuidan y realizamos una
              preparación completa para obtener los mejores resultados.
            </p>
            <div className={styles.ctaContainer}>
              <Link href="/appointments" className={styles.ctaLink}>
                Reserva tu cita y luce uñas perfectas
              </Link>

              {user && (
                <Link
                  href={`/referidos/${user.uid}`}
                  className={`${styles.ctaLink} ${styles.referralLink}`}
                >
                  Invita a tus amigos y gana beneficios
                </Link>
              )}
            </div>
          </div>
        </section>

        <ServicesSection />
        <LocationMap />
      </main>
    </>
  );
}
