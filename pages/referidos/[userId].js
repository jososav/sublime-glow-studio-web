import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import styles from "../../styles/Referral.module.css";
import { useAuthentication } from "../../providers/Authentication/authentication";
import Link from "next/link";

const ReferralPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuthentication();
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    const fetchReferrer = async () => {
      if (!userId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setReferrer(userDoc.data());
        } else {
          setError("Usuario referente no encontrado");
        }
      } catch (error) {
        console.error("Error fetching referrer:", error);
        setError("Error al cargar la información del referente");
      } finally {
        setLoading(false);
      }
    };

    fetchReferrer();
  }, [userId]);

  // If user is already logged in, show them a message
  if (user) {
    return (
      <div className={styles.container}>
        <div className={styles.alreadyLoggedIn}>
          <h1>Ya tienes una cuenta</h1>
          <p>Ya has iniciado sesión en Sublime Glow Studio.</p>
          
          {user.uid === userId ? (
            <>
              <p>Este es tu enlace de referidos. Compártelo con tus amigos para que se unan.</p>
              <Link href="/" className={styles.returnButton}>
                Volver al inicio
              </Link>
            </>
          ) : (
            <>
              <p>Puedes compartir tu propio enlace de referidos desde tu perfil.</p>
              <Link href={`/referidos/${user.uid}`} className={styles.returnButton}>
                Ir a mi enlace de referidos
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError("Por favor, completa todos los campos requeridos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      // Check if email is already registered
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError("Este correo electrónico ya está registrado");
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user document in Firestore
      const newUser = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        role: "client",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "users"), {
        id: userCredential.user.uid,
        ...newUser
      });

      // Create referral record
      await addDoc(collection(db, "referrals"), {
        referrerId: userId,
        referredId: userCredential.user.uid,
        createdAt: new Date().toISOString()
      });

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (error && !referrer) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.referralInfo}>
        <h1>¡Te han invitado a Sublime Glow Studio!</h1>
        {referrer && (
          <p>Invitado por: {referrer.firstName} {referrer.lastName}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Crear una cuenta</h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Nombre*:</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Apellido*:</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email*:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Teléfono:</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Contraseña*:</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Confirmar Contraseña*:</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Crear Cuenta
        </button>
      </form>
    </div>
  );
};

export default ReferralPage; 