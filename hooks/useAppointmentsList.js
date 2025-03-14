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
  updateDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

const APPOINTMENTS_PER_PAGE = 10;

const REFERRAL_REWARDS = {
  1: "SGS20",
  2: "SGS40",
  3: "SGS60",
  4: "SGS80",
  5: "SGS100"
};

const getRewardCouponCode = (completedReferrals) => {
  const cyclePosition = ((completedReferrals - 1) % 5) + 1;
  return REFERRAL_REWARDS[cyclePosition];
};

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
      
      // Collect all unique IDs we need to fetch
      const userIds = new Set();
      const serviceIds = new Set();
      const couponIds = new Set();
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        userIds.add(data.userId);
        serviceIds.add(data.serviceId);
        if (data.couponId) couponIds.add(data.couponId);
      });

      // Batch fetch users
      const usersData = {};
      const userPromises = Array.from(userIds).map(async userId => {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          usersData[userId] = userDoc.data();
        }
      });

      // Batch fetch services
      const servicesData = {};
      const servicePromises = Array.from(serviceIds).map(async serviceId => {
        const serviceDoc = await getDoc(doc(db, "services", serviceId));
        if (serviceDoc.exists()) {
          servicesData[serviceId] = {
            id: serviceId,
            ...serviceDoc.data()
          };
        }
      });

      // Batch fetch coupons
      const couponsData = {};
      const couponPromises = Array.from(couponIds).map(async couponId => {
        const couponDoc = await getDoc(doc(db, "coupons", couponId));
        if (couponDoc.exists()) {
          couponsData[couponId] = {
            id: couponId,
            ...couponDoc.data()
          };
        }
      });

      // Wait for all batch fetches to complete
      await Promise.all([
        ...userPromises,
        ...servicePromises,
        ...couponPromises
      ]);

      // Map the appointments with their related data
      const appointmentsList = querySnapshot.docs.map(docSnapshot => {
        const appointmentData = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...appointmentData,
          userData: usersData[appointmentData.userId] || null,
          serviceData: servicesData[appointmentData.serviceId] || null,
          couponData: appointmentData.couponId ? couponsData[appointmentData.couponId] : null
        };
      });

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
      const appointmentDoc = await getDoc(appointmentRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error("Appointment not found");
      }

      const appointmentData = appointmentDoc.data();
      const userId = appointmentData.userId;

      // Check previous appointments BEFORE updating status
      if (newStatus === "finalized") {
        // Check if this is the user's first finalized appointment
        const previousAppointmentsQuery = query(
          collection(db, "appointments"),
          where("userId", "==", userId),
          where("status", "==", "finalized")
        );
        const previousAppointments = await getDocs(previousAppointmentsQuery);

        // If there are no previous finalized appointments
        if (previousAppointments.size === 0) {
          // Query the referrals collection to find who referred this user
          const referralQuery = query(
            collection(db, "referrals"),
            where("referredId", "==", userId)
          );
          const referralSnapshot = await getDocs(referralQuery);

          if (!referralSnapshot.empty) {
            const referralDoc = referralSnapshot.docs[0];
            const referralData = referralDoc.data();
            const referrerId = referralData.referrerId;

            // Count how many successful referrals this referrer has
            const successfulReferralsQuery = query(
              collection(db, "referrals"),
              where("referrerId", "==", referrerId)
            );
            const successfulReferralsSnapshot = await getDocs(successfulReferralsQuery);
            
            // Filter referrals to count only those whose referred users have completed appointments
            const referralPromises = successfulReferralsSnapshot.docs.map(async (doc) => {
              const referredUserId = doc.data().referredId;
              if (referredUserId === userId) {
                // Don't count the current appointment yet
                return false;
              }
              const completedAppointmentsQuery = query(
                collection(db, "appointments"),
                where("userId", "==", referredUserId),
                where("status", "==", "finalized")
              );
              const completedAppointments = await getDocs(completedAppointmentsQuery);
              return completedAppointments.size > 0;
            });

            const successfulReferrals = (await Promise.all(referralPromises))
              .filter(Boolean)
              .length;

            // Add 1 to include the current referral that's being finalized
            const totalSuccessfulReferrals = successfulReferrals + 1;

            // Get the appropriate coupon code based on the number of successful referrals
            const couponCode = getRewardCouponCode(totalSuccessfulReferrals);

            // Find the existing coupon with this code
            const couponsRef = collection(db, "coupons");
            const couponQuery = query(couponsRef, where("code", "==", couponCode));
            const couponSnapshot = await getDocs(couponQuery);

            if (!couponSnapshot.empty) {
              const couponDoc = couponSnapshot.docs[0];
              
              // Check if the referrer already has this coupon assigned
              const existingAssignmentQuery = query(
                collection(db, "couponAssignments"),
                where("couponId", "==", couponDoc.id),
                where("userId", "==", referrerId),
                where("status", "==", "active")
              );
              const existingAssignment = await getDocs(existingAssignmentQuery);

              if (existingAssignment.empty) {
                // Assign the coupon only if it hasn't been assigned already
                await addDoc(collection(db, "couponAssignments"), {
                  couponId: couponDoc.id,
                  userId: referrerId,
                  status: "active",
                  createdAt: serverTimestamp(),
                  reason: `Referido ${userId} completó su primera cita`,
                  referredUserId: userId
                });
              }
            } else {
              console.error(`Coupon with code ${couponCode} not found`);
            }
          }
        }
      }

      // Update appointment status
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
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
      throw error;
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