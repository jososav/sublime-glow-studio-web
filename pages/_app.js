import "../styles/global.css";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

import { AuthenticationProvider } from "../providers/Authentication/authentication";
import Header from "../components/Header/header";
import Footer from "../components/Footer/footer";
import { Toaster } from "react-hot-toast";

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
      <Toaster position="top-right" />
    </AuthenticationProvider>
  );
}
