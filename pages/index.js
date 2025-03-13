import Head from "next/head";
import ServicesSection from "../components/ServicesSection/servicesSection";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sublime Glow Studio</title>
        <meta name="description" content="Sublime Glow Studio - Tu destino de belleza" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Sublime Glow Studio</h1>
            <p>Tu destino de belleza y bienestar</p>
          </div>
        </section>
        
        <ServicesSection />
      </main>
    </>
  );
}
