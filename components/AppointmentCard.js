import { useState, useRef, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import styles from "../styles/Mochita.module.css";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "confirmed", label: "Confirmada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "finalized", label: "Finalizada" }
];

export const AppointmentCard = ({ appointment, onStatusChange }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === appointment.status) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await onStatusChange(appointment.id, newStatus);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Fecha no especificada";
    try {
      let localDate;
      
      if (date instanceof Date) {
        localDate = date;
      } else if (typeof date === 'string') {
        // Si es un string ISO o YYYY-MM-DD
        if (date.includes('T')) {
          // Es un string ISO
          localDate = new Date(date);
        } else {
          // Es un string YYYY-MM-DD
          const [year, month, day] = date.split('-').map(Number);
          localDate = new Date(year, month - 1, day);
        }
      } else {
        return "Fecha inválida";
      }
      
      return localDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  const formatTime = (time) => {
    if (!time) return "Hora no especificada";
    return time.slice(0, 5);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "Duración no especificada";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}h`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      case "finalized":
        return "#6366f1";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status;
  };

  const userData = appointment.userData || {};
  const serviceData = appointment.serviceData || {};

  return (
    <div 
      ref={cardRef}
      className={`${styles.appointmentCard} ${updating ? styles.updating : ''} ${isEditing ? styles.editing : ''}`}
      onClick={() => !updating && !isEditing && setIsEditing(true)}
    >
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.appointmentHeader}>
        <div className={styles.date}>{formatDate(appointment.date)}</div>
        <div 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(appointment.status) }}
        >
          {getStatusLabel(appointment.status)}
        </div>
      </div>

      <div className={styles.userInfo}>
        <h3>{userData.firstName || "Nombre no especificado"} {userData.lastName || ""}</h3>
        <p>📧 {userData.email || "Email no especificado"}</p>
        <p>📱 {userData.phone || "Teléfono no especificado"}</p>
        {userData.birthday && (
          <p>🎂 {formatDate(userData.birthday)}</p>
        )}
      </div>

      <div className={styles.appointmentInfo}>
        <h4>Detalles de la Cita</h4>
        <p>⏰ {formatTime(appointment.startTime)}</p>
        <p>💇‍♀️ {serviceData.name || "Servicio no especificado"}</p>
        <p>⏱️ {formatDuration(serviceData.durationMinutes)}</p>
        {appointment.notes && (
          <p>📝 {appointment.notes}</p>
        )}
      </div>

      {isEditing && (
        <div className={styles.statusDropdown}>
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`${styles.statusOption} ${appointment.status === option.value ? styles.active : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(option.value);
              }}
              disabled={updating}
              style={{ 
                backgroundColor: option.value === appointment.status ? getStatusColor(option.value) : 'transparent',
                color: option.value === appointment.status ? 'white' : getStatusColor(option.value),
                borderColor: getStatusColor(option.value)
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 