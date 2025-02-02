import Head from "next/head";
import styles from "../styles/Home.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Sublime Glow Studio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 style={{ display: 'none' }}>Sublime Glow Studio</h1>
        <Image style={{borderRadius: '50%'}} src="/logo.jpeg" width="300" height='300' />
      </main>

      <style jsx global>{`
        html,
        body {
          background-color: #bba89c;
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
