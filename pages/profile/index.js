import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuthentication } from '../../providers/Authentication/authentication';
import styles from './Profile.module.css';

const ProfilePage = () => {
  const { user, userData, loading } = useAuthentication();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = router.asPath;
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Mi Perfil | Sublime Glow Studio</title>
        <meta name="description" content="Gestiona tu perfil, historial de citas y cupones en Sublime Glow Studio" />
        <meta name="robots" content="noindex, nofollow" /> {/* Private page */}
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Mi Perfil</h1>
        
        <div className={styles.userInfo}>
          <h2>¡Hola, {userData?.name || user.displayName || 'Cliente'}!</h2>
          <p className={styles.email}>{user.email}</p>
        </div>

        <div className={styles.menuGrid}>
          <Link href="/profile/edit" className={styles.menuItem}>
            <div className={styles.menuIcon}>✏️</div>
            <h3>Editar Información</h3>
            <p>Actualiza tus datos personales</p>
          </Link>

          <Link href="/profile/appointments" className={styles.menuItem}>
            <div className={styles.menuIcon}>📅</div>
            <h3>Historial de Citas</h3>
            <p>Revisa tus citas pasadas y próximas</p>
          </Link>

          <Link href="/profile/coupons" className={styles.menuItem}>
            <div className={styles.menuIcon}>🎫</div>
            <h3>Mis Cupones</h3>
            <p>Gestiona tus cupones disponibles</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ProfilePage; 