import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthentication } from '../../providers/Authentication/authentication';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from './Profile.module.css';

const EditProfilePage = () => {
  const { user, userData, loading } = useAuthentication();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user && userData) {
      setFormData({
        name: userData.name || user.displayName || '',
        phone: userData.phone || '',
        email: user.email || '',
      });
    }
  }, [user, userData, loading, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        updatedAt: new Date()
      });

      setSuccess('¡Información actualizada exitosamente!');
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar la información');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Editar Perfil | Sublime Glow Studio</title>
        <meta name="description" content="Actualiza tu información personal en Sublime Glow Studio" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Editar Perfil</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre y Apellido</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Ingresa tu nombre completo"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">Número de Teléfono (8 dígitos)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={styles.input}
              pattern="[0-9]{8}"
              maxLength="8"
              placeholder="Ejemplo: 88445566"
              title="Por favor ingresa un número de teléfono válido de 8 dígitos"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className={`${styles.input} ${styles.disabled}`}
              placeholder="ejemplo@correo.com"
            />
            <small>El correo electrónico no se puede modificar</small>
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.buttons}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.secondaryButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.primaryButton}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProfilePage; 