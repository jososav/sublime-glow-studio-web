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
} from "firebase/firestore";
import { db } from "../config/firebase";

const APPOINTMENTS_PER_PAGE = 10;

export const useAppointmentsList = (isAdmin) => {
  const [appointments, setAppointments] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  const fetchAppointments = async (lastDoc = null) => {
    try {
      setIsLoading(true);
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
        
        appointmentsList.push({
          id: docSnapshot.id,
          ...appointmentData,
          userData,
          serviceData: serviceData ? {
            id: appointmentData.serviceId,
            ...serviceData
          } : null
        });
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
    } finally {
      setIsLoading(false);
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

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(currentAppointments =>
      currentAppointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );
  };

  const refreshAppointments = () => {
    setLastVisible(null);
    fetchAppointments();
  };

  return {
    appointments,
    isLoading,
    hasMore,
    showOnlyPending,
    loadMore,
    togglePendingFilter,
    handleStatusChange,
    refreshAppointments,
  };
}; 