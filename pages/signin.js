import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebase";
import styles from "../styles/Signin.module.css";
import { useAuthentication } from "../providers/Authentication/authentication";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { event, setUserId, setUserProperties } from "../config/analytics";

const AuthPage = () => {
  const router = useRouter();
  const { user } = useAuthentication();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (user?.uid && router.isReady) {
      // Set user ID for GA4
      setUserId(user.uid);
      
      // Set user properties
      setUserProperties({
        user_type: 'authenticated',
        signup_method: 'email',
        has_profile: !!user.displayName,
      });

      const redirectPath = router.query.redirect || "/";
      router.replace(redirectPath);
    }
  }, [user, router.isReady, router]);

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthday: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      
      // Track successful login
      event({
        action: 'login',
        category: 'Authentication',
        label: 'Email',
        value: 1
      });

      // Set user properties after successful login
      setUserProperties({
        last_login: new Date().toISOString(),
        login_method: 'email',
      });

    } catch (error) {
      // Track failed login attempt
      event({
        action: 'login_error',
        category: 'Authentication',
        label: error.code,
        value: 1
      });

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Correo electrónico o contraseña incorrectos");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Demasiados intentos fallidos. Por favor, intenta más tarde");
      } else {
        setError("Error al iniciar sesión. Por favor, intenta de nuevo");
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    
    const { email, password, firstName, lastName, phone, birthday } = form;

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      await setDoc(doc(db, "users", user.uid), {
        phone,
        email,
        lastName,
        birthday: birthday ? birthday.toISOString() : null,
        firstName,
        createdAt: serverTimestamp(),
      });

      // Track successful signup
      event({
        action: 'sign_up',
        category: 'Authentication',
        label: 'Email',
        value: 1
      });

      // Set user properties after successful signup
      setUserProperties({
        signup_date: new Date().toISOString(),
        signup_method: 'email',
        has_phone: !!phone,
        has_birthday: !!birthday,
      });

    } catch (error) {
      // Track failed signup attempt
      event({
        action: 'signup_error',
        category: 'Authentication',
        label: error.code,
        value: 1
      });

      if (error.code === 'auth/email-already-in-use') {
        setError("Este correo electrónico ya está registrado");
      } else {
        setError("Error al crear la cuenta. Por favor, intenta de nuevo");
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "login" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("login");
              setError("");
            }}
          >
            Iniciar Sesión
          </button>
          <button
            className={`${styles.tab} ${activeTab === "signup" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("signup");
              setError("");
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {activeTab === "login" ? (
          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <button className={styles.confirm} type="submit">
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleSignUp}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="firstName"
                placeholder="Nombre"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="lastName"
                placeholder="Apellido"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={form.password}
                onChange={handleChange}
                required
              />
              <small className={styles.passwordHint}>
                Mínimo 6 caracteres
              </small>
            </div>
            <div className={styles.formGroup}>
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Fecha de Nacimiento</label>
              <DatePicker
                selected={form.birthday}
                onChange={(date) => {
                  setForm({ ...form, birthday: date });
                  setError("");
                }}
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                placeholderText="Selecciona tu fecha de nacimiento"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                wrapperClassName={styles.datePickerWrapper}
              />
            </div>
            <button className={styles.confirm} type="submit">
              Crear Cuenta
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
