import { useState } from "react";
import { AdminProtected } from "../../components/AdminProtected";
import { AppointmentCard } from "../../components/AppointmentCard";
import { useAppointmentsList } from "../../hooks/useAppointmentsList";
import { CreateAppointmentModal } from "../../components/CreateAppointmentModal";
import styles from "../../styles/Mochita.module.css";

const STATUS_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "finalized", label: "Finalizadas" }
];

const DATE_FILTERS = [
  { value: "all", label: "Todas las fechas" },
  { value: "today", label: "Hoy" },
  { value: "tomorrow", label: "Mañana" },
  { value: "week", label: "Esta semana" },
  { value: "month", label: "Este mes" }
];

const Appointments = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [dateFilter, setDateFilter] = useState("all");
  const { 
    appointments, 
    loading, 
    error, 
    refreshAppointments,
    handleStatusChange
  } = useAppointmentsList(true);

  const handleAppointmentStatusChange = async (appointmentId, newStatus) => {
    await handleStatusChange(appointmentId, newStatus);
    refreshAppointments();
  };

  const filterAppointments = (appointments) => {
    return appointments.filter(appointment => {
      // Status filter
      if (statusFilter !== "all" && appointment.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const appointmentDate = new Date(appointment.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        switch (dateFilter) {
          case "today":
            if (appointmentDate.toDateString() !== today.toDateString()) return false;
            break;
          case "tomorrow":
            if (appointmentDate.toDateString() !== tomorrow.toDateString()) return false;
            break;
          case "week":
            if (appointmentDate < weekStart || appointmentDate > weekEnd) return false;
            break;
          case "month":
            if (appointmentDate < monthStart || appointmentDate > monthEnd) return false;
            break;
        }
      }

      return true;
    });
  };

  const filteredAppointments = filterAppointments(appointments);

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

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Estado:</label>
            <div className={styles.filterButtons}>
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.filterButton} ${statusFilter === value ? styles.active : ''}`}
                  onClick={() => setStatusFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>Fecha:</label>
            <div className={styles.filterButtons}>
              {DATE_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  className={`${styles.filterButton} ${dateFilter === value ? styles.active : ''}`}
                  onClick={() => setDateFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : (
          <>
            <div className={styles.appointmentsSummary}>
              {filteredAppointments.length} cita{filteredAppointments.length !== 1 ? 's' : ''} encontrada{filteredAppointments.length !== 1 ? 's' : ''}
            </div>
            <div className={styles.appointmentsList}>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusChange={handleAppointmentStatusChange}
                  />
                ))
              ) : (
                <div className={styles.emptyState}>
                  No hay citas que coincidan con los filtros seleccionados
                </div>
              )}
            </div>
          </>
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