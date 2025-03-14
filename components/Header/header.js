import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/router';
import SocialLinks from '../SocialLinks/socialLinks';
import ProfileIcon from "../../containers/ProfileIcon/profileIcon";
import styles from "./header.module.css";

const Header = () => {
  const router = useRouter();
  const isMochitaPage = router.pathname.startsWith('/mochita');
  const homeLink = isMochitaPage ? '/mochita' : '/';

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
          <div className={styles.navigation}>
            <Link href="/articulos" className={styles.navLink}>
              Artículos
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
