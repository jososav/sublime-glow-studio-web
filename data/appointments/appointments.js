import {
  query,
  where,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

import { db } from "../../config/firebase";
import { appointmentCreatedTemplate, appointmentCreatedAdminTemplate } from "../../helpers/emailTemplates";
import { sendEmail } from "../../helpers/sendEmail";

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
    // Check for existing pending appointments
    const pendingCount = await getPendingAppointmentsCount(appointment.userId);
    
    if (pendingCount >= MAX_PENDING_APPOINTMENTS) {
      return { 
        success: false, 
        error: "No puedes tener más de 3 citas pendientes. Por favor, confirma o cancela alguna de tus citas existentes." 
      };
    }

    // Add the appointment to Firestore
    const appointmentsRef = collection(db, "appointments");
    const docRef = await addDoc(appointmentsRef, {
      ...appointment,
      status: "pending",
      createdAt: Timestamp.now(),
    });

    // Get user data for email personalization
    const userDoc = await getDoc(doc(db, "users", appointment.userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    // Send email to user
    const userEmailTemplate = appointmentCreatedTemplate(appointment, userData);
    await sendEmail(
      appointment.email,
      userEmailTemplate.subject,
      userEmailTemplate.text,
      userEmailTemplate.html
    );

    // Send email to admin
    const adminEmailTemplate = appointmentCreatedAdminTemplate(appointment, userData);
    await sendEmail(
      "carolvek52@gmail.com",
      adminEmailTemplate.subject,
      adminEmailTemplate.text,
      adminEmailTemplate.html
    );

    return { success: true, appointmentId: docRef.id };
  } catch (error) {
    console.error("Error saving appointment:", error);
    return { 
      success: false, 
      error: "Error al crear la cita. Por favor, intenta nuevamente más tarde." 
    };
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
