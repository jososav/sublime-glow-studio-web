import Head from 'next/head';
import styles from './promociones.module.css';

const PromocionesPage = () => {
  return (
    <>
      <Head>
        <title>Promociones y Cupones de Descuento | Sublime Glow Studio</title>
        <meta
          name="description"
          content="Descubre nuestros cupones de descuento y programa de referidos. Obtén hasta 100% de descuento refiriendo amigos. Cupones desde 20% hasta 100% de descuento en servicios de belleza."
        />
        <meta
          name="keywords"
          content="cupones de descuento, promociones belleza, descuentos salon, programa referidos, cupones belleza, descuentos servicios belleza"
        />
        {/* Open Graph */}
        <meta
          property="og:title"
          content="Promociones y Cupones de Descuento | Sublime Glow Studio"
        />
        <meta
          property="og:description"
          content="Descubre nuestros cupones de descuento y programa de referidos. Obtén hasta 100% de descuento refiriendo amigos."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sublimeglowstudio.com/promociones" />
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Promociones y Cupones de Descuento | Sublime Glow Studio"
        />
        <meta
          name="twitter:description"
          content="Descubre nuestros cupones de descuento y programa de referidos. Obtén hasta 100% de descuento refiriendo amigos."
        />
      </Head>
      <div className={styles.container}>
        <h1 className={styles.title}>Promociones y Cupones</h1>
        
        <div className={styles.section}>
          <h2>¿Cómo funcionan nuestros cupones?</h2>
          <p>
            Los cupones son una forma de obtener descuentos en tus próximas citas. 
            Puedes acumular cupones y utilizarlos cuando lo desees para obtener descuentos especiales en nuestros servicios.
          </p>
        </div>

        <div className={styles.earnSection}>
          <h2>¿Cómo obtener cupones?</h2>
          
          <div className={styles.method}>
            <h3>1. Registrándote con un enlace de referido</h3>
            <p>
              Cuando te registras usando el enlace de referido de otro cliente, 
              recibirás automáticamente un cupón de bienvenida que podrás usar en tu primera cita.
            </p>
            <div className={styles.couponInfo}>
              <h4>Cupón de Bienvenida</h4>
              <ul>
                <li>🎉 10% de descuento en tu primera cita</li>
                <li>⏰ Válido por 30 días desde tu registro</li>
                <li>💝 Aplicable a cualquier servicio</li>
              </ul>
            </div>
          </div>

          <div className={styles.method}>
            <h3>2. Refiriendo a otros clientes</h3>
            <p>
              Por cada persona que se registre usando tu enlace de referido y complete una cita, 
              recibirás un cupón de recompensa. ¡Entre más amigos invites, más cupones puedes ganar!
            </p>
            <div className={styles.couponInfo}>
              <h4>Cupones por Referidos</h4>
              <div className={styles.referralTiers}>
                <div className={styles.tier}>
                  <h5>Cupón Bronce</h5>
                  <ul>
                    <li>🥉 20% de descuento</li>
                    <li>1er referido</li>
                  </ul>
                </div>
                <div className={styles.tier}>
                  <h5>Cupón Plata</h5>
                  <ul>
                    <li>🥈 40% de descuento</li>
                    <li>2do referido</li>
                  </ul>
                </div>
                <div className={styles.tier}>
                  <h5>Cupón Oro</h5>
                  <ul>
                    <li>🥇 60% de descuento</li>
                    <li>3er referido</li>
                  </ul>
                </div>
                <div className={styles.tier}>
                  <h5>Cupón Platino</h5>
                  <ul>
                    <li>💎 80% de descuento</li>
                    <li>4to referido</li>
                  </ul>
                </div>
                <div className={styles.tier}>
                  <h5>Cupón Diamante</h5>
                  <ul>
                    <li>💫 100% de descuento</li>
                    <li>5to referido</li>
                  </ul>
                </div>
              </div>
            </div>
            <ul className={styles.benefits}>
              <li>Tus amigos obtienen un descuento en su primera cita</li>
              <li>Tú recibes un cupón cuando ellos completan su cita</li>
              <li>No hay límite en la cantidad de personas que puedes referir</li>
              <li>Los cupones son válidos por 60 días desde su emisión</li>
            </ul>
          </div>
        </div>

        <div className={styles.notes}>
          <p>
            * Los cupones son válidos por tiempo limitado y deben ser utilizados antes de su fecha de expiración.
          </p>
          <p>
            * Los cupones no son acumulables entre sí en una misma cita.
          </p>
        </div>
      </div>
    </>
  );
};

export default PromocionesPage; 