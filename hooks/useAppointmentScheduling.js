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
    if (selectedDate && selectedService.id) {
      const dayName = getDayName(selectedDate);
      const workSchedule = schedule[dayName];
      console.log('Debug - Selected Date:', selectedDate);
      console.log('Debug - Day Name:', dayName);
      console.log('Debug - Work Schedule:', workSchedule);
      console.log('Debug - Selected Service:', selectedService);

      // Fetch appointments for the selected date
      const getAppointments = async () => {
        try {
          // Format date string ensuring it's in the local timezone
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;
          
          const appointmentsRef = collection(db, "appointments");
          const q = query(appointmentsRef, where("date", "==", dateString));
          const querySnapshot = await getDocs(q);
          const appointmentsList = [];
          querySnapshot.forEach((doc) => {
            appointmentsList.push({ id: doc.id, ...doc.data() });
          });
          console.log('Debug - Appointments List:', appointmentsList);
          
          if (workSchedule && Array.isArray(workSchedule) && selectedService.durationMinutes) {
            console.log('Debug - Calculating slots with:', {
              workSchedule,
              duration: selectedService.durationMinutes,
              appointments: appointmentsList
            });
            const slots = calculateTimeSlots(workSchedule, selectedService.durationMinutes, appointmentsList);
            console.log('Debug - Calculated Time Slots:', slots);
            setTimeSlots(slots);
          } else {
            console.log('Debug - Missing required data:', {
              hasWorkSchedule: !!workSchedule,
              isArray: Array.isArray(workSchedule),
              duration: selectedService.durationMinutes
            });
            setTimeSlots([]);
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
          setTimeSlots([]);
        }
      };

      if (workSchedule) {
        console.log('Debug - Work schedule found, fetching appointments');
        getAppointments();
      } else {
        console.log('Debug - No work schedule for day:', dayName);
        setTimeSlots([]);
      }
    } else {
      console.log('Debug - Missing date or service:', { 
        hasDate: !!selectedDate, 
        hasService: !!selectedService.id 
      });
      setTimeSlots([]);
    }
  }, [selectedDate, selectedService, schedule]);

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