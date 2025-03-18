import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuthentication } from '../../providers/Authentication/authentication';
import { useUserCoupons } from '../../hooks/useUserCoupons';
import styles from './Profile.module.css';

const CouponsPage = () => {
  const { user, loading } = useAuthentication();
  const router = useRouter();
  const { coupons, loading: loadingCoupons, error } = useUserCoupons(user?.uid);

  if (loading || loadingCoupons) return <div>Cargando...</div>;
  if (!user) {
    const currentPath = router.asPath;
    router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
    return null;
  }

  const availableCoupons = coupons.filter(c => !c.used && (!c.expirationDate || new Date(c.expirationDate) > new Date()));
  const otherCoupons = coupons.filter(c => c.used || (c.expirationDate && new Date(c.expirationDate) <= new Date()));

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
                        <span className={styles.discount}>{coupon.discountPercentage}% OFF</span>
                      </div>
                      
                      <div className={styles.couponDetails}>
                        <p className={styles.couponCode}>{coupon.code}</p>
                        <p className={styles.couponType}>{coupon.type || 'Descuento General'}</p>
                        {coupon.expirationDate && (
                          <p className={styles.expiration}>
                            Válido hasta: {new Date(coupon.expirationDate).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
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
                    const status = coupon.used ? 'used' : 'expired';
                    const statusText = coupon.used ? 'Usado' : 'Expirado';
                    return (
                      <div key={coupon.id} className={`${styles.couponCard} ${styles.inactive}`}>
                        <div className={styles.couponHeader}>
                          <span className={`${styles.couponStatus} ${styles[status]}`}>
                            {statusText}
                          </span>
                          <span className={styles.discount}>{coupon.discountPercentage}% OFF</span>
                        </div>
                        
                        <div className={styles.couponDetails}>
                          <p className={styles.couponCode}>{coupon.code}</p>
                          <p className={styles.couponType}>{coupon.type || 'Descuento General'}</p>
                          {coupon.used && coupon.usedDate && (
                            <p className={styles.usedDate}>
                              Usado el: {new Date(coupon.usedDate).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          )}
                          {coupon.expirationDate && (
                            <p className={styles.expiration}>
                              Expiró el: {new Date(coupon.expirationDate).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
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