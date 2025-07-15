import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../config/firebase";
import styles from "../styles/Signin.module.css";
import { useAuthentication } from "../providers/Authentication/authentication";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { event, setUserId, setUserProperties } from "../config/analytics";
import { track, events, trackError } from "../config/mixpanel";

const AuthPage = () => {
  const router = useRouter();
  const { user } = useAuthentication();
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  
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
    setSuccessMessage(""); // Clear success message when user types
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    try {
      // Set language to Spanish before sending the reset email
      auth.languageCode = 'es';
      await sendPasswordResetEmail(auth, resetEmail);
      
      // Track password reset request in GA4
      event({
        action: 'password_reset_request',
        category: 'Authentication',
        label: 'Email',
        value: 1
      });

      // Track in Mixpanel
      track(events.PASSWORD_RESET_REQUEST, {
        email: resetEmail
      });

      setSuccessMessage("Se ha enviado un correo electrónico para restablecer tu contraseña");
      setShowResetForm(false);
      setResetEmail("");
    } catch (error) {
      // Track error in GA4
      event({
        action: 'password_reset_error',
        category: 'Authentication',
        label: error.code,
        value: 1
      });

      // Track error in Mixpanel
      trackError(error, {
        context: 'Password Reset',
        email: resetEmail
      });

      if (error.code === 'auth/user-not-found') {
        setError("No existe una cuenta con este correo electrónico");
      } else if (error.code === 'auth/invalid-email') {
        setError("Correo electrónico inválido");
      } else {
        setError("Error al enviar el correo de recuperación. Por favor, intenta de nuevo");
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
      
      // Track successful login in GA4
      event({
        action: 'login',
        category: 'Authentication',
        label: 'Email',
        value: 1
      });

      // Track successful login in Mixpanel
      track(events.LOGIN, {
        method: 'email',
        email: form.email
      });

      // Set user properties after successful login
      setUserProperties({
        last_login: new Date().toISOString(),
        login_method: 'email',
      });

    } catch (error) {
      // Track failed login attempt in GA4
      event({
        action: 'login_error',
        category: 'Authentication',
        label: error.code,
        value: 1
      });

      // Track error in Mixpanel
      trackError(error, {
        context: 'Login',
        email: form.email
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

      // Track successful signup in GA4
      event({
        action: 'sign_up',
        category: 'Authentication',
        label: 'Email',
        value: 1
      });

      // Track successful signup in Mixpanel
      track(events.SIGNUP, {
        method: 'email',
        email,
        has_phone: !!phone,
        has_birthday: !!birthday
      });

      // Set user properties after successful signup
      setUserProperties({
        signup_date: new Date().toISOString(),
        signup_method: 'email',
        has_phone: !!phone,
        has_birthday: !!birthday,
      });

    } catch (error) {
      // Track failed signup attempt in GA4
      event({
        action: 'signup_error',
        category: 'Authentication',
        label: error.code,
        value: 1
      });

      // Track error in Mixpanel
      trackError(error, {
        context: 'Signup',
        email: form.email
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
              setSuccessMessage("");
              setShowResetForm(false);
            }}
          >
            Iniciar Sesión
          </button>
          <button
            className={`${styles.tab} ${activeTab === "signup" ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveTab("signup");
              setError("");
              setSuccessMessage("");
              setShowResetForm(false);
            }}
          >
            Crear Cuenta
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {successMessage && <div className={styles.success}>{successMessage}</div>}

        {activeTab === "login" && !showResetForm ? (
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
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => {
                setShowResetForm(true);
                setError("");
                setSuccessMessage("");
              }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        ) : activeTab === "login" && showResetForm ? (
          <form className={styles.form} onSubmit={handleResetPassword}>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setError("");
                  setSuccessMessage("");
                }}
                required
              />
            </div>
            <button className={styles.confirm} type="submit">
              Enviar correo de recuperación
            </button>
            <button
              type="button"
              className={styles.forgotPassword}
              onClick={() => {
                setShowResetForm(false);
                setError("");
                setSuccessMessage("");
              }}
            >
              Volver al inicio de sesión
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
