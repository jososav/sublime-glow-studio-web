import DatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

import { getDayName, toAmPm } from "../../helpers/time";
import styles from "./calendarBooking.module.css";
import { formatCurrency } from "../../helpers/currency";
import { fetchServices } from "../../data/services/services";
import {
  getAppointmentsForDay,
  saveAppointment,
} from "../../data/appointments/appointments";
import { fetchSchedule } from "../../data/configuration/configuration";
import { useAuthentication } from "../../providers/Authentication/authentication";
import {
  buildAppointment,
  calculateTimeSlots,
} from "../../helpers/appointments";

const Confirmation = ({
  selectedDate,
  selectedSlot,
  handleCreateAppointment,
  isCreating,
}) => {
  if (!selectedSlot) return null;

  return (
    <div>
      <p>
        Has seleccionado el día {selectedDate.toLocaleDateString("es-ES")} a las{" "}
        {selectedSlot}.
      </p>
      <button 
        className={styles.confirmation} 
        onClick={handleCreateAppointment}
        disabled={isCreating}
      >
        {isCreating ? "Creando..." : "Confirmar Cita"}
      </button>
    </div>
  );
};

const Time = ({
  schedule,
  selectedDate,
  selectedSlot,
  setSelectedSlot,
  selectedService,
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const dayName = getDayName(selectedDate);
    const workSchedule = schedule[dayName];

    setTimeSlots(
      calculateTimeSlots(
        workSchedule,
        selectedService.durationMinutes,
        appointments
      )
    );
  }, [appointments, selectedService]);

  useEffect(() => {
    getAppointmentsForDay(selectedDate).then((data) => {
      setAppointments(data);
    });
  }, [selectedDate]);

  if (!selectedDate) return null;

  if (!timeSlots.length) return <div>No hay citas disponibles.</div>;

  return (
    <div>
      <h3>Selecciona la hora de inicio</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {timeSlots.map((slot) => (
          <li
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            style={{
              cursor: "pointer",
              padding: "5px",
              border:
                selectedSlot === slot ? "2px solid blue" : "1px solid gray",
              marginBottom: "5px",
              display: "inline-block",
              marginRight: "5px",
            }}
          >
            {toAmPm(slot)}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Calendar = ({
  schedule,
  selectedDate,
  selectedService,
  setSelectedDate,
}) => {
  if (!selectedService.id) return null;

  return (
    <div className={styles.calendar}>
      <label>Selecciona la fecha:</label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        filterDate={(date) => {
          const day = date.toLocaleDateString("en-EN", { weekday: "long" });

          return Object.keys(schedule).includes(day.toLowerCase());
        }}
        placeholderText="Elige una fecha"
      />
    </div>
  );
};

const Service = ({ setSelectedService, selectedService }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices().then((data) => {
      setServices(data);
    });
  }, []);

  const handleProductoChange = (event) => {
    const service = services.find(
      (service) => service.id === event.target.value
    );

    setSelectedService(service);
  };

  return (
    <div>
      <div className={styles.product}>
        <label>Producto:</label>
        <select value={selectedService.id} onChange={handleProductoChange}>
          <option value="" disabled>
            Selecciona un producto
          </option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const CalendarBooking = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedService, setSelectedService] = useState({ id: "" });
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuthentication();

  useEffect(() => {
    fetchSchedule().then((data) => {
      setSchedule(data);
    });
  }, []);

  if (!user) return <div>Necesitas registrarte para crear citas.</div>;

  const appointment =
    selectedSlot &&
    buildAppointment(selectedDate, user.uid, selectedService, selectedSlot);

  const handleCreateAppointment = async () => {
    if (!appointment) return;
    
    setIsCreating(true);
    const success = await saveAppointment(appointment);
    setIsCreating(false);
    
    if (success) {
      setSelectedSlot(null);
      setSelectedDate(null);
      setSelectedService({ id: "" });
    }
  };

  return (
    <div>
      <h1>Reserva tu Cita</h1>

      <Service
        selectedService={selectedService}
        setSelectedService={setSelectedService}
      />

      <Calendar
        schedule={schedule}
        selectedDate={selectedDate}
        selectedService={selectedService}
        setSelectedDate={setSelectedDate}
      />

      <Time
        schedule={schedule}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        setSelectedSlot={setSelectedSlot}
        selectedService={selectedService}
      />

      <Confirmation
        selectedSlot={selectedSlot}
        selectedDate={selectedDate}
        handleCreateAppointment={handleCreateAppointment}
        isCreating={isCreating}
      />
    </div>
  );
};

export default CalendarBooking;
