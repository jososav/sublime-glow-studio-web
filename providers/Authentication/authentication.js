import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

const AuthenticationContext = createContext({});

export const useAuthentication = () => useContext(AuthenticationContext);

const Authentication = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Error fetching user data:", error);
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

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export default Authentication;
