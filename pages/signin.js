import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, createUserWithEmailAndPassword } from "firebase/auth";

import { auth, db } from "../config/firebase";

import styles from "../styles/Signin.module.css";
import { useAuthentication } from "../providers/Authentication/authentication";
import Link from "next/link";

const Signin = () => {
  const router = useRouter();
  const { user } = useAuthentication();

  if (user?.uid) {
    router.replace("/");
  }

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    birthday: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { email, password, firstName, lastName, phone, birthday } = form;

    try {
      // Create the user using email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Update the user's profile (only displayName is available in Firebase Auth)
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      // Save additional user info in Firestore under a "users" collection
      await setDoc(doc(db, "users", user.uid), {
        phone,
        email,
        lastName,
        birthday,
        firstName,
        createdAt: serverTimestamp(),
      });

      console.log("User created successfully!");
      // Optionally, clear the form or navigate to another page
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <>
      <div className={styles.login}>
        <Link href="login">Ya tienes cuenta? Accede con tu contraseña</Link>
      </div>
      <form className={styles.wrapper} onSubmit={handleSignUp}>
        <input
          type="text"
          name="firstName"
          placeholder="Nombre"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="lastName"
          placeholder="Apellido"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Teléfono"
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="birthday"
          placeholder="Fecha de nacimiento"
          onChange={handleChange}
          required
        />
        <button className={styles.confirm} type="submit">
          Crear Cuenta
        </button>
      </form>
    </>
  );
};

export default Signin;
