import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { useState } from 'react';
import SocialLinks from '../SocialLinks/socialLinks';
import ProfileIcon from "../../containers/ProfileIcon/profileIcon";
import styles from "./header.module.css";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMochitaPage = router.pathname.startsWith('/mochita');
  const homeLink = isMochitaPage ? '/mochita' : '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <nav>
        <Link href={homeLink} className={styles.logo}>
          <Image
            src="/logo.jpeg"
            alt="logo"
            width={80}
            height={80}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        </Link>
        <div className={styles.headerContent}>
          <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle menu">
            <span className={styles.menuIcon}></span>
          </button>
          <div className={`${styles.navigation} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <Link href="/articulos" className={styles.navLink}>
              Artículos
            </Link>
            <Link href="/promociones" className={styles.navLink}>
              Promociones
            </Link>
          </div>
          <SocialLinks />
        </div>
        <span className={styles.profileIcon}>
          <ProfileIcon />
        </span>
      </nav>
    </header>
  );
};

export default Header;
