import Link from "next/link";
import { FiUser } from "react-icons/fi";

import styles from "./profileIcon.module.css";
import Avatar from "../../components/Avatar/avatar";
import { signInWithGoogle, logout } from "../../config/firebase";
import { useAuthentication } from "../../providers/Authentication/authentication";

export default function ProfileIcon() {
  const { user, userData, loading } = useAuthentication();

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <FiUser size={20} />
      </div>
    );
  }

  return userData ? (
    <button onClick={logout}>
      <Avatar user={userData} />
    </button>
  ) : (
    <Link href={"signin"}>
      <div className={styles.wrapper}>
        <FiUser size={20} />
      </div>
    </Link>
  );
}
