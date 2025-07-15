import Image from 'next/image';
import styles from './LocationMap.module.css';

export default function LocationMap() {
  // Convert DMS coordinates to decimal for Google Maps
  // 9°59'38.9"N 84°40'01.6"W = 9.994139, -84.667111

  return (
    <section className={styles.locationSection}>
      <div className={styles.container}>
        <h2 className={styles.title}>Encuéntranos</h2>
        <p className={styles.description}>
          Visítanos en nuestro estudio para experimentar nuestros servicios de belleza profesionales.
        </p>
        <div className={styles.mapContainer}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d981.8706935843595!2d-84.6670026!3d9.9941359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa037f75aeedd5b%3A0xd456fb8b20300e3a!2sSublime%20Glow%20Studio!5e0!3m2!1sen!2scr!4v1710633486447!5m2!1sen!2scr"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className={styles.info}>
          <div className={styles.infoItem}>
            <h3>Dirección</h3>
            <p>100m norte y 25m oeste de la Vidriera de Esparza, Puntarenas.</p>
          </div>
          <div className={styles.infoItem}>
            <h3>Horario</h3>
            <p>Lunes a Sábado: 8:00 AM - 6:00 PM</p>
            <p>Domingo: Cerrado</p>
          </div>
          <div className={styles.infoItem}>
            <h3>WhatsApp</h3>
            <p>
              <a 
                href="https://wa.me/50663580568" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.whatsappLink}
              >
                <Image
                  src="/whatsapp-icon.svg"
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className={styles.whatsappIcon}
                />
                <span>6358-0568</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 