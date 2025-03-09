import Image from "next/image";

import styles from "./header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <nav>
        <Image
          style={{ borderRadius: "50%" }}
          src="/logo.jpeg"
          width="300"
          height="300"
        />
      </nav>
    </header>
  );
};

export default Header;
