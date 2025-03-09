import { FiUser } from "react-icons/fi";

import styles from "./profileIcon.module.css";
import Avatar from "../../components/Avatar/avatar";
import { signInWithGoogle, logout } from "../../config/firebase";
import { useAuthentication } from "../../providers/Authentication/authentication";

export default function Login() {
  const { user } = useAuthentication();

  return user ? (
    <button onClick={logout}>
      <Avatar user={user} />
    </button>
  ) : (
    <button onClick={signInWithGoogle}>
      <div className={styles.wrapper}>
        <FiUser size={20} />
      </div>
    </button>
  );
}
