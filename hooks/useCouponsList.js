import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "../config/firebase";

export const useCouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const couponsRef = collection(db, "coupons");
      const q = query(couponsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const couponsList = [];

      for (const docSnapshot of querySnapshot.docs) {
        const couponData = docSnapshot.data();
        
        // Si el cupón está asignado a un usuario, obtener sus datos
        let userData = null;
        if (couponData.userId) {
          const userDoc = await getDoc(doc(db, "users", couponData.userId));
          userData = userDoc.exists() ? userDoc.data() : null;
        }
        
        couponsList.push({
          id: docSnapshot.id,
          ...couponData,
          userData
        });
      }

      setCoupons(couponsList);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    loading,
    error,
    refreshCoupons: fetchCoupons
  };
}; 