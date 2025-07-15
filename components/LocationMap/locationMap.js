import styles from './LocationMap.module.css';
import { track } from '../../config/mixpanel';

export default function LocationMap() {
  const handleWhatsAppClick = () => {
    track("WhatsApp Button Clicked", {
      location: "location_section",
      phone_number: "6358-0568",
      url: "https://wa.me/50663580568",
      timestamp: new Date().toISOString()
    });
  };

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
                onClick={handleWhatsAppClick}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.whatsappIcon}
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5027 3.49734C18.2276 1.22203 15.2025 0 12 0C5.40996 0 0.00315857 5.40681 0 12C0 14.1 0.550781 16.1503 1.59469 17.9625L0 24L6.18281 22.4438C7.92153 23.397 9.87434 23.9019 11.8653 23.9025H11.8687C18.4584 23.9025 23.8668 18.4947 23.8699 11.8944C23.8699 8.69437 22.6481 5.77266 20.5027 3.49734ZM12 21.9844H11.8975C10.1203 21.9838 8.37809 21.5087 6.85622 20.6122L6.49622 20.4047L2.81341 21.3375L3.76497 17.7478L3.53497 17.3747C2.55466 15.7934 2.03466 13.9266 2.03466 12C2.03466 6.52031 6.52028 2.03469 12.0309 2.03469C14.7137 2.03469 17.2425 3.05859 19.1262 4.94391C21.0099 6.82922 22.0321 9.35859 22.0321 12.0422C22.0289 17.4759 17.5433 21.9844 12 21.9844Z" fill="#25D366"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.4659 14.7006C17.1928 14.5641 15.7237 13.8478 15.4725 13.7559C15.2212 13.6641 15.0387 13.6184 14.8562 13.8916C14.6737 14.1647 14.1056 14.8353 13.9462 15.0178C13.7869 15.2003 13.6275 15.2231 13.3544 15.0866C13.0812 14.95 12.1187 14.6144 10.9781 13.5978C10.0837 12.8041 9.48094 11.8187 9.32156 11.5456C9.16219 11.2725 9.30469 11.1244 9.44094 10.9878C9.56344 10.8644 9.71344 10.6644 9.84969 10.505C9.98594 10.3456 10.0316 10.2309 10.1234 10.0484C10.2153 9.86594 10.1694 9.70656 10.1006 9.57C10.0319 9.43344 9.43219 7.96094 9.20531 7.41469C8.98469 6.88469 8.76094 6.95719 8.59219 6.94781C8.43281 6.93906 8.25031 6.93844 8.06781 6.93844C7.88531 6.93844 7.58781 7.00719 7.33656 7.28031C7.08531 7.55344 6.32156 8.26969 6.32156 9.74219C6.32156 11.2147 7.35969 12.6187 7.49594 12.8012C7.63219 12.9837 9.47781 15.8119 12.2894 16.9916C13.0087 17.3041 13.5712 17.4866 14.0087 17.6234C14.7259 17.8478 15.3806 17.8144 15.8962 17.7428C16.4684 17.6634 17.6753 17.0228 17.9022 16.3847C18.1291 15.7466 18.1291 15.2003 18.0603 15.0866C17.9916 14.9728 17.7391 14.9041 17.4659 14.7006Z" fill="#25D366"/>
                </svg>
                <span>6358-0568</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 