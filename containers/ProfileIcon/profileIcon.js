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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowDropdown(false);
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || isLoggingOut) {
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
        aria-label="Menu de cliente"
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
            onClick={handleLogout}
            className={styles.dropdownItem}
            disabled={isLoggingOut}
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
