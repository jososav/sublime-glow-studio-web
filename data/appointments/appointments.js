import {
  query,
  where,
  addDoc,
  getDocs,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../config/firebase";

export const saveAppointment = async (appointment) => {
  try {
    await addDoc(collection(db, "appointments"), {
      ...appointment,
      createdAt: serverTimestamp(),
    });

    alert("Cita creada exitosamente");
  } catch (error) {
    console.error("Error al crear la cita: ", error);
    alert("Error al crear la cita");
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
