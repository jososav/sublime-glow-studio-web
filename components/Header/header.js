import Link from "next/link";
import Image from "next/image";

import ProfileIcon from "../../containers/ProfileIcon/profileIcon";
import styles from "./header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <Link href="/">
          <Image
            style={{ borderRadius: "50%" }}
            src="/logo.jpeg"
            alt="logo"
            width="300"
            height="300"
          />
        </Link>
        <span className={styles.profileIcon}>
          <ProfileIcon />
        </span>
      </nav>
    </header>
  );
};

export default Header;
