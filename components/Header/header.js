import Link from "next/link";
import Image from "next/image";
import SocialLinks from '../SocialLinks/socialLinks';
import ProfileIcon from "../../containers/ProfileIcon/profileIcon";
import styles from "./header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo.jpeg"
            alt="logo"
            width={80}
            height={80}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
        </Link>
        <div className={styles.headerContent}>
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
