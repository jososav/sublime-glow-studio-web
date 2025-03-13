import {
  query,
  where,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../config/firebase";

const MAX_PENDING_APPOINTMENTS = 3;

export const getPendingAppointmentsCount = async (userId) => {
  try {
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef,
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error checking pending appointments:", error);
    return 0;
  }
};

export const saveAppointment = async (appointment) => {
  try {
    const pendingCount = await getPendingAppointmentsCount(appointment.userId);
    
    if (pendingCount >= MAX_PENDING_APPOINTMENTS) {
      alert("No puedes tener más de 3 citas pendientes. Por favor, confirma o cancela alguna de tus citas existentes.");
      return false;
    }

    await addDoc(collection(db, "appointments"), {
      ...appointment,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    alert("Cita creada exitosamente");
    return true;
  } catch (error) {
    console.error("Error al crear la cita: ", error);
    alert("Error al crear la cita");
    return false;
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, "appointments", appointmentId);
    await updateDoc(appointmentRef, {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error al actualizar el estado de la cita:", error);
    return false;
  }
};

export const getAppointmentsForDay = async (selectedDate) => {
  if (!selectedDate) return [];

  // Convert the selectedDate (a Date object) to a "YYYY-MM-DD" string
  const dateString = selectedDate.toISOString().split("T")[0];

  // Reference the "appointments" collection in Firestore
  const appointmentsRef = collection(db, "appointments");

  // Create a query to find appointments with a matching "date" field
  const q = query(appointmentsRef, where("date", "==", dateString));

  // Execute the query
  const querySnapshot = await getDocs(q);
  const appointments = [];

  querySnapshot.forEach((doc) => {
    appointments.push({ id: doc.id, ...doc.data() });
  });

  return appointments;
};
