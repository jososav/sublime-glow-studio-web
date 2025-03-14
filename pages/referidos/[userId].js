import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, collection, addDoc, query, where, getDocs, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import styles from "../../styles/Referral.module.css";
import { useAuthentication } from "../../providers/Authentication/authentication";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const ReferralPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useAuthentication();
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
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

  const handleCopyLink = async () => {
    const referralLink = `${window.location.origin}/referidos/${userId}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // If user is already logged in, show them a message
  if (user) {
    const referralLink = `${window.location.origin}/referidos/${userId}`;
    const whatsappText = encodeURIComponent(`¡Hola! Te invito a unirte a Sublime Glow Studio. Regístrate usando mi enlace y obtén un 10% de descuento en tu primer cita: ${referralLink}`);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

    return (
      <div className={styles.container}>
        <div className={styles.alreadyLoggedIn}>
          {user.uid === userId ? (
            <div className={styles.sharingSection}>
              <h1>Tu enlace de referidos</h1>
              <p>Invita a tus amigos y gana cupones de descuento por cada referido.</p>
              
              <div className={styles.sharingButtons}>
                <button 
                  onClick={handleCopyLink}
                  className={styles.copyButton}
                >
                  {copied ? "¡Enlace Copiado!" : "Copiar Enlace"}
                </button>

                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  Compartir por WhatsApp
                </a>
              </div>

              <div className={styles.qrSection}>
                <h3>Código QR</h3>
                <div className={styles.qrContainer}>
                  <QRCodeSVG 
                    value={referralLink}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p>Escanea este código para compartir tu enlace</p>
              </div>

              <Link href="/" className={styles.returnButton}>
                Volver al inicio
              </Link>
            </div>
          ) : (
            <>
              <h1>Ya tienes una cuenta</h1>
              <p>Ya has iniciado sesión en Sublime Glow Studio.</p>
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
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      } catch (authError) {
        console.error("Error creating Firebase Auth user:", authError);
        setError("Error al crear la cuenta: " + authError.message);
        return;
      }

      // Create user document in Firestore
      const newUser = {
        id: userCredential.user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || "",
        role: "client",
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      } catch (userDocError) {
        console.error("Error creating user document:", userDocError);
        setError("Error al guardar los datos del usuario");
        return;
      }

      // Create referral record
      try {
        await addDoc(collection(db, "referrals"), {
          referrerId: userId,
          referredId: userCredential.user.uid,
          createdAt: new Date().toISOString()
        });
      } catch (referralError) {
        console.error("Error creating referral record:", referralError);
        // Don't return here, as the user is already created
      }

      // Find and assign the SGS10 coupon
      try {
        const couponsRef = collection(db, "coupons");
        const couponQuery = query(couponsRef, where("code", "==", "SGS10"));
        const couponSnapshot = await getDocs(couponQuery);

        if (!couponSnapshot.empty) {
          const coupon = { id: couponSnapshot.docs[0].id, ...couponSnapshot.docs[0].data() };
          
          await addDoc(collection(db, "couponAssignments"), {
            couponId: coupon.id,
            userId: userCredential.user.uid,
            status: "active",
            createdAt: new Date().toISOString(),
            reason: "Registro por referido"
          });
        } else {
          console.warn("SGS10 coupon not found");
        }
      } catch (couponError) {
        console.error("Error assigning welcome coupon:", couponError);
        // Don't return here, as the user is already created
      }

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      setError("Error inesperado al crear la cuenta");
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