import "../styles/global.css";
import styles from "../styles/Footer.module.css";
import Header from "../components/Header/header";
import Authentication from "../providers/Authentication/authentication";

function MyApp({ Component, pageProps }) {
  return (
    <Authentication>
      <>
        <Header />

        {/* Main Content */}
        <main className={styles.content}>
          <Component {...pageProps} />
        </main>

        {/* Footer */}
        <footer className={styles.wrapper}>
          <p>&copy; 2025 Sublime Glow Studio. Todos los derechos reservados.</p>
        </footer>
      </>
    </Authentication>
  );
}

export default MyApp;
