import { useState, useRef, useEffect } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import styles from "../styles/Mochita.module.css";
import { useUserCoupons } from "../hooks/useUserCoupons";

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
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const cardRef = useRef(null);
  const { coupons, loading: loadingCoupons } = useUserCoupons(appointment.userId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsEditing(false);
        setIsEditingCoupon(false);
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

  const handleCouponChange = async (newCouponId) => {
    setUpdating(true);
    setError(null);

    try {
      // If there was a previous coupon, reactivate it
      if (appointment.couponAssignmentId) {
        await updateDoc(doc(db, "couponAssignments", appointment.couponAssignmentId), {
          status: "active",
          usedAt: null,
          appointmentId: null
        });
      }

      if (!newCouponId) {
        // Remove coupon from appointment
        await updateDoc(doc(db, "appointments", appointment.id), {
          couponId: null,
          couponAssignmentId: null,
          discountPercentage: null
        });
        
        // Update the local appointment data
        appointment.couponId = null;
        appointment.couponAssignmentId = null;
        appointment.discountPercentage = null;
        appointment.couponData = null;
      } else {
        // Get the new coupon data
        const selectedCoupon = coupons.find(c => c.id === newCouponId);
        if (!selectedCoupon) throw new Error("Cupón no encontrado");

        // Update the appointment with new coupon data
        await updateDoc(doc(db, "appointments", appointment.id), {
          couponId: selectedCoupon.id,
          couponAssignmentId: selectedCoupon.assignmentId,
          discountPercentage: selectedCoupon.discountPercentage
        });

        // Mark the new coupon as used
        await updateDoc(doc(db, "couponAssignments", selectedCoupon.assignmentId), {
          status: "used",
          usedAt: new Date().toISOString(),
          appointmentId: appointment.id
        });

        // Update the local appointment data
        appointment.couponId = selectedCoupon.id;
        appointment.couponAssignmentId = selectedCoupon.assignmentId;
        appointment.discountPercentage = selectedCoupon.discountPercentage;
        appointment.couponData = selectedCoupon;
      }

      setIsEditingCoupon(false);
    } catch (error) {
      console.error("Error updating coupon:", error);
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
        
        <div className={styles.couponSection}>
          {isEditingCoupon ? (
            <div className={styles.couponEdit}>
              <select
                value={appointment.couponId || ""}
                onChange={(e) => handleCouponChange(e.target.value)}
                disabled={updating || loadingCoupons}
              >
                <option value="">Sin cupón</option>
                {coupons?.map(coupon => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} - {coupon.discountPercentage}% de descuento
                  </option>
                ))}
              </select>
              <button 
                className={styles.cancelButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingCoupon(false);
                }}
                disabled={updating}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className={styles.couponDisplay}>
              {(appointment.couponId || appointment.couponData) ? (
                <div className={styles.couponInfo}>
                  <p>🎟️ Cupón: {appointment.couponData?.code || 'No disponible'}</p>
                  <p className={styles.discountInfo}>
                    Descuento: {appointment.discountPercentage || appointment.couponData?.discountPercentage}%
                  </p>
                  <button
                    className={styles.editCouponButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingCoupon(true);
                    }}
                    disabled={updating}
                  >
                    Cambiar Cupón
                  </button>
                </div>
              ) : (
                <button
                  className={styles.addCouponButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingCoupon(true);
                  }}
                  disabled={updating}
                >
                  Agregar Cupón
                </button>
              )}
            </div>
          )}
        </div>
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