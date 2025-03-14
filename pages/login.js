import { useState } from "react";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../config/firebase";
import styles from "../styles/Signin.module.css";
import { useAuthentication } from "../providers/Authentication/authentication";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { user } = useAuthentication();
  const router = useRouter();

  if (user?.uid) {
    router.replace("/");
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect will happen automatically due to auth state change
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <form className={styles.wrapper} onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button className={styles.confirm} type="submit">
        Iniciar Sesión
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

export default Login;
