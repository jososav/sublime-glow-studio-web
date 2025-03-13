import SocialLinks from '../SocialLinks/socialLinks';
import styles from './footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <SocialLinks />
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Sublime Glow Studio. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 