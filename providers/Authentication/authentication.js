import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { useRouter } from "next/router";
import { identifyUser, track, events } from "../../config/mixpanel";

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

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Get the previous auth state from localStorage
      const previousAuthState = localStorage.getItem('previousAuthState');
      const wasLoggedOut = !previousAuthState || previousAuthState === 'null';
      const isLoggingIn = wasLoggedOut && user;
      
      setUser(user);
      
      // Store the new auth state
      localStorage.setItem('previousAuthState', user ? user.uid : null);
      
      if (user) {
        try {
          // Always identify user in Mixpanel
          await identifyUser(user);
          
          // Only track login event if this is an actual login
          if (isLoggingIn) {
            console.log('Tracking login event - actual login detected');
            await track(events.LOGIN, {
              method: user.providerData[0]?.providerId || 'unknown',
              email_verified: user.emailVerified
            });
          } else {
            console.log('Skipping login event - user already logged in');
          }
          
          await fetchUserData(user.uid);
        } catch (error) {
          console.error('Error during auth state change:', error);
        }
      } else {
        // Reset Mixpanel identity when user logs out
        if (userData) { // Only track logout if there was a user before
          try {
            await track(events.LOGOUT);
            await identifyUser(null);
            // Clear the previous auth state
            localStorage.removeItem('previousAuthState');
          } catch (error) {
            console.error('Error during logout:', error);
          }
        }
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
