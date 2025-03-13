import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthentication } from "../providers/Authentication/authentication";
import { toAmPm, formatDuration } from "../helpers/time";
import { updateAppointmentStatus, saveAppointment } from "../data/appointments/appointments";
import { buildAppointment } from "../helpers/appointments";
import { useAppointmentScheduling } from "../hooks/useAppointmentScheduling";
import { useAppointmentsList } from "../hooks/useAppointmentsList";
import { useUsers } from "../hooks/useUsers";
import ServiceSelection from "../components/ServiceSelection/serviceSelection";
import styles from "../styles/Mochita.module.css";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
];

const CreateAppointmentModal = ({ onClose, onSuccess }) => {
  const [selectedUser, setSelectedUser] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const modalRef = useRef(null);
  const { users } = useUsers();
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

  const handleCreateAppointment = async () => {
    if (!selectedUser || !selectedService.id || !selectedDate || !selectedSlot) {
      alert("Por favor, completa todos los campos");
      return;
    }

    setIsCreating(true);
    const appointment = buildAppointment(selectedDate, selectedUser, selectedService, selectedSlot);
    
    if (appointment) {
      const success = await saveAppointment(appointment);
      if (success) {
        resetScheduling();
        onSuccess();
        onClose();
      }
    }
    setIsCreating(false);
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
        
        <div className={styles.formGroup}>
          <label>Cliente:</label>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">Seleccionar cliente</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} - {user.phone}
              </option>
            ))}
          </select>
        </div>

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
            disabled={isCreating || !selectedUser || !selectedService.id || !selectedDate || !selectedSlot}
          >
            {isCreating ? "Creando..." : "Crear Cita"}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentCard = ({ appointment, onStatusChange }) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsChangingStatus(false);
      }
    };

    if (isChangingStatus) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChangingStatus]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === appointment.status) {
      setIsChangingStatus(false);
      return;
    }

    setUpdating(true);
    const success = await updateAppointmentStatus(appointment.id, newStatus);
    if (success) {
      onStatusChange(appointment.id, newStatus);
    }
    setUpdating(false);
    setIsChangingStatus(false);
  };

  return (
    <div 
      ref={cardRef}
      className={`${styles.appointmentCard} ${updating ? styles.updating : ''}`}
      onClick={() => !updating && setIsChangingStatus(true)}
    >
      <div className={styles.appointmentHeader}>
        <span className={styles.date}>
          {new Date(appointment.date).toLocaleDateString("es-ES")}
        </span>
        {isChangingStatus ? (
          <select
            className={styles.statusSelect}
            value={appointment.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            disabled={updating}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span className={`${styles.status} ${styles[appointment.status]}`}>
            {STATUS_OPTIONS.find(opt => opt.value === appointment.status)?.label || appointment.status}
          </span>
        )}
      </div>
      
      <div className={styles.userInfo}>
        <h3>{appointment.userData?.firstName} {appointment.userData?.lastName}</h3>
        <p>📱 {appointment.userData?.phone}</p>
        <p>📧 {appointment.userData?.email}</p>
        {appointment.userData?.birthday && (
          <p>🎂 {new Date(appointment.userData.birthday).toLocaleDateString("es-ES")}</p>
        )}
      </div>

      <div className={styles.appointmentTime}>
        <span>
          Hora: {toAmPm(appointment.startTime)} - {toAmPm(appointment.endTime)}
        </span>
      </div>
      
      {appointment.serviceData && (
        <div className={styles.serviceInfo}>
          <h4>Servicio</h4>
          <p>🎨 {appointment.serviceData.name}</p>
          <p>⏱️ Duración: {formatDuration(appointment.serviceData.durationMinutes)}</p>
        </div>
      )}
      
      {isChangingStatus && (
        <div className={styles.statusHelp}>
          Click fuera para cancelar
        </div>
      )}
    </div>
  );
};

const Mochita = () => {
  const router = useRouter();
  const { user, userData, isAdmin, loading: authLoading } = useAuthentication();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const {
    appointments,
    isLoading,
    hasMore,
    showOnlyPending,
    loadMore,
    togglePendingFilter,
    handleStatusChange,
    refreshAppointments,
  } = useAppointmentsList(isAdmin);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/404");
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Lista de Citas</h1>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          Crear Nueva Cita
        </button>
      </div>

      <div className={styles.filterContainer}>
        <button
          onClick={togglePendingFilter}
          className={`${styles.filterButton} ${
            showOnlyPending ? styles.active : ""
          }`}
        >
          {showOnlyPending ? "Mostrar Todas" : "Mostrar Solo Pendientes"}
        </button>
      </div>

      <div className={styles.appointmentsList}>
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {isLoading && <div className={styles.loading}>Cargando...</div>}

      {hasMore && !isLoading && (
        <button onClick={loadMore} className={styles.loadMoreButton}>
          Cargar Más
        </button>
      )}

      {showCreateModal && (
        <CreateAppointmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshAppointments}
        />
      )}
    </div>
  );
};

export default Mochita;
