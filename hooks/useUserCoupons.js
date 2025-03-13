import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const useUserCoupons = (userId) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCoupons = async () => {
      if (!userId) {
        setCoupons([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get all coupon assignments for the user
        const assignmentsRef = collection(db, "couponAssignments");
        const assignmentsQuery = query(
          assignmentsRef,
          where("userId", "==", userId),
          where("status", "==", "active")
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        
        // Get the actual coupon data for each assignment
        const couponsData = [];
        for (const assignmentDoc of assignmentsSnapshot.docs) {
          const assignmentData = assignmentDoc.data();
          const couponRef = collection(db, "coupons");
          const couponQuery = query(
            couponRef,
            where("__name__", "==", assignmentData.couponId)
          );
          const couponSnapshot = await getDocs(couponQuery);
          
          if (!couponSnapshot.empty) {
            const couponDoc = couponSnapshot.docs[0];
            couponsData.push({
              id: couponDoc.id,
              assignmentId: assignmentDoc.id,
              ...couponDoc.data()
            });
          }
        }

        setCoupons(couponsData);
      } catch (error) {
        console.error("Error fetching user coupons:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCoupons();
  }, [userId]);

  return { coupons, loading, error };
}; 