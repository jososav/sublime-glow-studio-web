import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useRouter } from "next/router";

const AuthenticationContext = createContext({});

export const useAuthentication = () => useContext(AuthenticationContext);

export const AuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubscribed = false;

    const fetchUserData = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (!unsubscribed) {
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
          setLoading(false);
        }
      } catch (error) {
        if (!unsubscribed) {
          setLoading(false);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchUserData(user.uid);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin: Boolean(userData?.isAdmin)
  };

  // Only show loading for Mochita-related pages
  const isMochitaPage = router.pathname.startsWith('/mochita');
  
  if (loading && isMochitaPage) {
    return <div>Loading...</div>;
  }

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};
