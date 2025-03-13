import "../styles/global.css";
import styles from "../styles/Footer.module.css";
import Header from "../components/Header/header";
import Footer from "../components/Footer/footer";
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

        <Footer />
      </>
    </Authentication>
  );
}

export default MyApp;
