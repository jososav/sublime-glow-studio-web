import "../styles/global.css";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

import { AuthenticationProvider } from "../providers/Authentication/authentication";
import Header from "../components/Header/header";
import Footer from "../components/Footer/footer";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthenticationProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </AuthenticationProvider>
  );
}
