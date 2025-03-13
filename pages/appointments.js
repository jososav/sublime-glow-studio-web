import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthentication } from "../providers/Authentication/authentication";
import { toAmPm } from "../helpers/time";
import { saveAppointment } from "../data/appointments/appointments";
import { buildAppointment } from "../helpers/appointments";
import { useAppointmentScheduling } from "../hooks/useAppointmentScheduling";
import ServiceSelection from "../components/ServiceSelection/serviceSelection";
import styles from "../styles/Appointments.module.css";

const Appointments = () => {
  const { user, userData } = useAuthentication();
  const {
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
  } = useAppointmentScheduling();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAppointment = async () => {
    if (!selectedService.id || !selectedDate || !selectedSlot) {
      alert("Por favor, selecciona un servicio, fecha y hora");
      return;
    }

    setIsCreating(true);
    try {
      const appointmentData = {
        userId: user.uid,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        date: selectedDate,
        startTime: selectedSlot,
        service: selectedService.name,
        serviceId: selectedService.id,
        durationMinutes: selectedService.durationMinutes,
        notes: "",
        status: "pending"
      };

      const appointment = buildAppointment(appointmentData);
      
      if (appointment) {
        const success = await saveAppointment(appointment);
        if (success) {
          resetScheduling();
        }
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user || !userData) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Agendar Cita</h1>

      <ServiceSelection
        services={services}
        selectedService={selectedService}
        onServiceSelect={setSelectedService}
      />

      {selectedService.id && (
        <div className={styles.formGroup}>
          <label>Fecha:</label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            filterDate={(date) => {
              const day = date.toLocaleDateString("en-EN", { weekday: "long" });
              return Object.keys(schedule).includes(day.toLowerCase());
            }}
            placeholderText="Seleccionar fecha"
          />
        </div>
      )}

      {selectedDate && timeSlots.length > 0 && (
        <div className={styles.formGroup}>
          <label>Hora:</label>
          <div className={styles.timeSlots}>
            {timeSlots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`${styles.timeSlot} ${
                  selectedSlot === slot ? styles.selected : ""
                }`}
              >
                {toAmPm(slot)}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className={styles.createButton}
        onClick={handleCreateAppointment}
        disabled={isCreating || !selectedService.id || !selectedDate || !selectedSlot}
      >
        {isCreating ? "Creando..." : "Agendar Cita"}
      </button>
    </div>
  );
};

export default Appointments;
