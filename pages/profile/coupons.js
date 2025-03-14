import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthentication } from '../../providers/Authentication/authentication';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from './Profile.module.css';

const CouponsPage = () => {
  const { user, loading } = useAuthentication();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchCoupons = async () => {
      if (user) {
        try {
          const couponsRef = collection(db, 'coupons');
          const q = query(
            couponsRef,
            where('userId', '==', user.uid)
          );
          
          const querySnapshot = await getDocs(q);
          const couponsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            expirationDate: doc.data().expirationDate?.toDate()
          }));

          setCoupons(couponsData);
        } catch (err) {
          console.error('Error fetching coupons:', err);
          setError('Error al cargar los cupones');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCoupons();
  }, [user, loading, router]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCouponStatus = (coupon) => {
    if (coupon.used) {
      return { text: 'Usado', className: styles.used };
    }
    
    const now = new Date();
    if (coupon.expirationDate && coupon.expirationDate < now) {
      return { text: 'Expirado', className: styles.expired };
    }
    
    return { text: 'Disponible', className: styles.available };
  };

  if (loading || isLoading) return <div>Cargando...</div>;
  if (!user) return null;

  const availableCoupons = coupons.filter(c => !c.used && (!c.expirationDate || c.expirationDate > new Date()));
  const otherCoupons = coupons.filter(c => c.used || (c.expirationDate && c.expirationDate <= new Date()));

  return (
    <>
      <Head>
        <title>Mis Cupones | Sublime Glow Studio</title>
        <meta name="description" content="Gestiona tus cupones de descuento en Sublime Glow Studio" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Mis Cupones</h1>

        {error && <div className={styles.error}>{error}</div>}

        {coupons.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tienes cupones disponibles</p>
            <Link href="/promociones" className={styles.link}>
              Ver cómo obtener cupones
            </Link>
          </div>
        ) : (
          <>
            {availableCoupons.length > 0 && (
              <div className={styles.couponSection}>
                <h2>Cupones Disponibles</h2>
                <div className={styles.couponGrid}>
                  {availableCoupons.map((coupon) => (
                    <div key={coupon.id} className={styles.couponCard}>
                      <div className={styles.couponHeader}>
                        <span className={`${styles.couponStatus} ${styles.available}`}>
                          Disponible
                        </span>
                        <span className={styles.discount}>{coupon.discount}% OFF</span>
                      </div>
                      
                      <div className={styles.couponDetails}>
                        <p className={styles.couponCode}>{coupon.code}</p>
                        <p className={styles.couponType}>{coupon.type}</p>
                        {coupon.expirationDate && (
                          <p className={styles.expiration}>
                            Válido hasta: {formatDate(coupon.expirationDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherCoupons.length > 0 && (
              <div className={styles.couponSection}>
                <h2>Cupones Usados o Expirados</h2>
                <div className={styles.couponGrid}>
                  {otherCoupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    return (
                      <div key={coupon.id} className={`${styles.couponCard} ${styles.inactive}`}>
                        <div className={styles.couponHeader}>
                          <span className={`${styles.couponStatus} ${status.className}`}>
                            {status.text}
                          </span>
                          <span className={styles.discount}>{coupon.discount}% OFF</span>
                        </div>
                        
                        <div className={styles.couponDetails}>
                          <p className={styles.couponCode}>{coupon.code}</p>
                          <p className={styles.couponType}>{coupon.type}</p>
                          {coupon.used && (
                            <p className={styles.usedDate}>
                              Usado el: {formatDate(coupon.usedDate.toDate())}
                            </p>
                          )}
                          {coupon.expirationDate && (
                            <p className={styles.expiration}>
                              Expiró el: {formatDate(coupon.expirationDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default CouponsPage; 