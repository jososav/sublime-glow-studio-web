import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "../config/firebase";

const APPOINTMENTS_PER_PAGE = 10;

export const useAppointmentsList = (isAdmin) => {
  const [appointments, setAppointments] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAppointments = async (lastDoc = null) => {
    try {
      setIsLoading(true);
      setLoading(true);
      setError(null);
      
      const appointmentsRef = collection(db, "appointments");

      let q = query(
        appointmentsRef,
        orderBy("date", "desc"),
        orderBy("startTime", "desc")
      );

      if (showOnlyPending) {
        q = query(q, where("status", "==", "pending"));
      }

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(APPOINTMENTS_PER_PAGE));

      const querySnapshot = await getDocs(q);
      const appointmentsList = [];

      for (const docSnapshot of querySnapshot.docs) {
        const appointmentData = docSnapshot.data();
        
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", appointmentData.userId));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        // Fetch service data
        const serviceDoc = await getDoc(doc(db, "services", appointmentData.serviceId));
        const serviceData = serviceDoc.exists() ? serviceDoc.data() : null;

        // Fetch coupon data if the appointment has a coupon
        let couponData = null;
        if (appointmentData.couponId) {
          const couponDoc = await getDoc(doc(db, "coupons", appointmentData.couponId));
          if (couponDoc.exists()) {
            couponData = {
              id: couponDoc.id,
              ...couponDoc.data()
            };
          }
        }
        
        const finalAppointment = {
          id: docSnapshot.id,
          ...appointmentData,
          userData,
          serviceData: serviceData ? {
            id: appointmentData.serviceId,
            ...serviceData
          } : null,
          couponData
        };
        appointmentsList.push(finalAppointment);
      }

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(appointmentsList.length === APPOINTMENTS_PER_PAGE);

      if (lastDoc) {
        setAppointments((prev) => [...prev, ...appointmentsList]);
      } else {
        setAppointments(appointmentsList);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAppointments();
    }
  }, [showOnlyPending, isAdmin]);

  const loadMore = () => {
    if (!hasMore || isLoading) return;
    fetchAppointments(lastVisible);
  };

  const togglePendingFilter = () => {
    setLastVisible(null);
    setShowOnlyPending(!showOnlyPending);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus
      });
      
      // Update local state
      setAppointments(currentAppointments =>
        currentAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw error; // Propagate error to component
    }
  };

  const refreshAppointments = () => {
    setLastVisible(null);
    fetchAppointments();
  };

  return {
    appointments,
    loading,
    error,
    isLoading,
    hasMore,
    showOnlyPending,
    loadMore,
    togglePendingFilter,
    handleStatusChange,
    refreshAppointments,
  };
}; 