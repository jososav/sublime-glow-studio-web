import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FiUser, FiLogOut, FiUser as FiProfile } from "react-icons/fi";

import styles from "./profileIcon.module.css";
import Avatar from "../../components/Avatar/avatar";
import { signInWithGoogle, logout } from "../../config/firebase";
import { useAuthentication } from "../../providers/Authentication/authentication";

export default function ProfileIcon() {
  const { user, userData, loading } = useAuthentication();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  // Reset dropdown state when user changes
  useEffect(() => {
    setShowDropdown(false);
  }, [user, userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setShowDropdown(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <FiUser size={20} />
      </div>
    );
  }

  return userData ? (
    <div className={styles.profileContainer}>
      <button 
        ref={avatarRef}
        className={styles.avatarButton}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Menu de usuario"
      >
        <Avatar user={userData} />
      </button>
      
      {showDropdown && (
        <div ref={dropdownRef} className={styles.dropdown}>
          <Link 
            href="/profile" 
            className={styles.dropdownItem}
            onClick={() => setShowDropdown(false)}
          >
            <FiProfile size={18} />
            <span>Mi Perfil</span>
          </Link>
          <button 
            onClick={() => {
              setShowDropdown(false);
              logout();
            }} 
            className={styles.dropdownItem}
          >
            <FiLogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  ) : (
    <Link href={"signin"}>
      <div className={styles.wrapper}>
        <FiUser size={20} />
      </div>
    </Link>
  );
}
