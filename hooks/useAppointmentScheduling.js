import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { getDayName } from "../helpers/time";
import { fetchServices } from "../data/services/services";
import { fetchSchedule } from "../data/configuration/configuration";
import { calculateTimeSlots } from "../helpers/appointments";

export const useAppointmentScheduling = () => {
  const [services, setServices] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [selectedService, setSelectedService] = useState({ id: "" });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Fetch services and schedule
  useEffect(() => {
    fetchServices().then(setServices);
    fetchSchedule().then(setSchedule);
  }, []);

  // Calculate time slots
  useEffect(() => {
    if (selectedDate) {
      const dayName = getDayName(selectedDate);
      const workSchedule = schedule[dayName];

      // Fetch appointments for the selected date
      const getAppointments = async () => {
        const dateString = selectedDate.toISOString().split("T")[0];
        const appointmentsRef = collection(db, "appointments");
        const q = query(appointmentsRef, where("date", "==", dateString));
        const querySnapshot = await getDocs(q);
        const appointmentsList = [];
        querySnapshot.forEach((doc) => {
          appointmentsList.push({ id: doc.id, ...doc.data() });
        });
        setAppointments(appointmentsList);
      };

      getAppointments();
      setTimeSlots(calculateTimeSlots(workSchedule, selectedService.durationMinutes, appointments));
    }
  }, [selectedDate, selectedService, schedule, appointments]);

  const resetScheduling = () => {
    setSelectedService({ id: "" });
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  return {
    services,
    schedule,
    selectedService,
    setSelectedService,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    timeSlots,
    resetScheduling,
  };
}; 