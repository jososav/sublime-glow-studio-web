import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import styles from "../styles/Mochita.module.css";
import { buildAppointment } from "../helpers/appointments";
import { useUsers } from "../hooks/useUsers";
import { useAppointmentScheduling } from "../hooks/useAppointmentScheduling";
import { toAmPm } from "../helpers/time";

const ServiceCard = ({ service, isSelected, onClick }) => (
  <div 
    className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
    onClick={onClick}
  >
    <h3>{service.name}</h3>
    <div className={styles.serviceDetails}>
      <span>⏱️ Duración: {Math.floor(service.durationMinutes / 60)}:{(service.durationMinutes % 60).toString().padStart(2, '0')}h</span>
    </div>
  </div>
);

export const CreateAppointmentModal = ({ onClose, onSuccess, isAdmin = false }) => {
  const { users, loading: loadingUsers, error: usersError } = useUsers();
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
    loading: loadingServices,
    error: servicesError
  } = useAppointmentScheduling();

  const [formData, setFormData] = useState({
    userId: ""
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const selectedUser = users.find(user => user.id === formData.userId);

  const checkPendingAppointments = async (userId) => {
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef, 
      where("userId", "==", userId),
      where("status", "==", "pending")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  };

  const handleCreateAppointment = async () => {
    console.log('=== STARTING APPOINTMENT CREATION ===');
    console.log('Selected date before validation:', selectedDate);
    
    if (!formData.userId || !selectedSlot || !selectedService?.id) {
      const missingFields = [];
      if (!formData.userId) missingFields.push('usuario');
      if (!selectedSlot) missingFields.push('hora');
      if (!selectedService?.id) missingFields.push('servicio');
      
      const errorMsg = `Por favor, completa los campos obligatorios: ${missingFields.join(', ')}`;
      setError(errorMsg);
      return;
    }

    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate)) {
      setError("Por favor, selecciona una fecha válida");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Only check pending appointments limit for non-admin users
      if (!isAdmin) {
        const pendingCount = await checkPendingAppointments(formData.userId);
        if (pendingCount >= 3) {
          setError("El usuario ya tiene el máximo de 3 citas pendientes permitidas");
          setIsCreating(false);
          return;
        }
      }

      // Create appointment date at noon to avoid timezone issues
      const appointmentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      console.log('Final appointment date:', appointmentDate);

      const appointmentData = {
        userId: selectedUser.id,
        firstName: selectedUser.firstName || "",
        lastName: selectedUser.lastName || "",
        email: selectedUser.email || "",
        phone: selectedUser.phone || "",
        date: appointmentDate,
        startTime: selectedSlot,
        service: selectedService.name,
        serviceId: selectedService.id,
        durationMinutes: selectedService.durationMinutes,
        notes: "",
        status: "pending"
      };

      console.log('Appointment data:', appointmentData);
      
      const appointment = buildAppointment(appointmentData);
      console.log('Built appointment:', appointment);

      const appointmentRef = await addDoc(collection(db, "appointments"), appointment);
      console.log('Appointment saved with ID:', appointmentRef.id);
      
      resetScheduling();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modal}>
        <h2>Crear Nueva Cita</h2>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Cliente*:</label>
          {loadingUsers ? (
            <div>Cargando usuarios...</div>
          ) : usersError ? (
            <div className={styles.errorMessage}>
              Error al cargar usuarios: {usersError}
            </div>
          ) : users.length === 0 ? (
            <div className={styles.errorMessage}>
              No hay usuarios disponibles. Por favor, crea un usuario primero.
            </div>
          ) : (
            <select
              value={formData.userId}
              onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
            >
              <option value="">Selecciona un cliente</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedUser && (
          <div className={styles.selectedUserInfo}>
            <p>📱 {selectedUser.phone || "No especificado"}</p>
            <p>📧 {selectedUser.email || "No especificado"}</p>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Servicio*:</label>
          {loadingServices ? (
            <div>Cargando servicios...</div>
          ) : servicesError ? (
            <div className={styles.errorMessage}>
              Error al cargar servicios: {servicesError}
            </div>
          ) : services.length === 0 ? (
            <div className={styles.errorMessage}>
              No hay servicios disponibles. Por favor, crea un servicio primero.
            </div>
          ) : (
            <div className={styles.servicesGrid}>
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  isSelected={selectedService?.id === service.id}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedService?.id && (
          <div className={styles.formGroup}>
            <label>Fecha*:</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                // Create date in local timezone at start of day
                const localDate = new Date(date);
                // Adjust for timezone offset to ensure the date stays the same
                const offset = localDate.getTimezoneOffset();
                localDate.setMinutes(localDate.getMinutes() + offset);
                
                console.log('Selected date:', date);
                console.log('Local date adjusted:', localDate);
                console.log('Date string:', localDate.toISOString());
                setSelectedDate(localDate);
              }}
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
            <label>Hora*:</label>
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

        {selectedDate && timeSlots.length === 0 && (
          <div className={styles.errorMessage}>
            No hay horarios disponibles para esta fecha
          </div>
        )}

        <div className={styles.modalActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
            disabled={isCreating}
          >
            Cancelar
          </button>
          <button
            className={styles.createButton}
            onClick={handleCreateAppointment}
            disabled={isCreating || !formData.userId || !selectedSlot || !selectedService?.id}
          >
            {isCreating ? "Creando..." : "Crear Cita"}
          </button>
        </div>
      </div>
    </div>
  );
}; 