import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const useReferrals = (userId) => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!userId) {
        setReferrals([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all referrals where the user is the referrer
        const referralsRef = collection(db, "referrals");
        const q = query(referralsRef, where("referrerId", "==", userId));
        const querySnapshot = await getDocs(q);

        // Get referred user data for each referral
        const referralsData = [];
        for (const doc of querySnapshot.docs) {
          const referralData = doc.data();
          const userDoc = await getDocs(
            query(
              collection(db, "users"),
              where("id", "==", referralData.referredId)
            )
          );

          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            referralsData.push({
              id: doc.id,
              ...referralData,
              referredUser: userData
            });
          }
        }

        setReferrals(referralsData);
      } catch (error) {
        console.error("Error fetching referrals:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [userId]);

  return { referrals, loading, error };
}; 