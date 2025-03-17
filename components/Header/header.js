import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { useAuthentication } from '../../providers/Authentication/authentication';
import ProfileIcon from "../../containers/ProfileIcon/profileIcon";
import styles from "./header.module.css";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuthentication();
  const isMochitaPage = router.pathname.startsWith('/mochita');
  const homeLink = isMochitaPage ? '/mochita' : '/';
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navRef.current && 
        !navRef.current.contains(event.target) &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    router.events.on('routeChangeStart', closeMenu);
    return () => router.events.off('routeChangeStart', closeMenu);
  }, [router]);

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
          <button 
            ref={menuButtonRef}
            className={styles.menuButton} 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
          >
            <span className={styles.menuIcon}></span>
          </button>
          <div 
            ref={navRef}
            className={`${styles.navigation} ${isMenuOpen ? styles.menuOpen : ''}`}
          >
            <Link href="/articulos" className={styles.navLink}>
              Artículos
            </Link>
            <Link href="/promociones" className={styles.navLink}>
              Promociones
            </Link>
          </div>
        </div>
        <span className={styles.profileIcon}>
          <ProfileIcon />
        </span>
      </nav>
    </header>
  );
};

export default Header;
