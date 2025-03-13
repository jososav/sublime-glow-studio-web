import { useState } from "react";
import { AdminProtected } from "../../components/AdminProtected";
import { AppointmentCard } from "../../components/AppointmentCard";
import { useAppointmentsList } from "../../hooks/useAppointmentsList";
import { CreateAppointmentModal } from "../../components/CreateAppointmentModal";
import styles from "../../styles/Mochita.module.css";

const Appointments = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { 
    appointments, 
    loading, 
    error, 
    refreshAppointments, 
    showOnlyPending, 
    togglePendingFilter,
    handleStatusChange
  } = useAppointmentsList(true);

  const handleAppointmentStatusChange = async (appointmentId, newStatus) => {
    await handleStatusChange(appointmentId, newStatus);
    refreshAppointments();
  };

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Citas</h1>
          <div className={styles.headerActions}>
            <button 
              className={styles.createButton}
              onClick={() => setShowCreateModal(true)}
            >
              Crear Nueva Cita
            </button>
          </div>
        </div>

        <button
          className={`${styles.filterButton} ${showOnlyPending ? styles.active : ''}`}
          onClick={togglePendingFilter}
        >
          {showOnlyPending ? 'Mostrar Todas' : 'Mostrar Pendientes'}
        </button>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : (
          <div className={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onStatusChange={handleAppointmentStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAppointmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refreshAppointments();
          }}
          isAdmin={true}
        />
      )}
    </AdminProtected>
  );
};

export default Appointments; 