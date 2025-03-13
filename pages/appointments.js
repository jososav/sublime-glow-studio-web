import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuthentication } from "../providers/Authentication/authentication";
import { toAmPm } from "../helpers/time";
import { saveAppointment } from "../data/appointments/appointments";
import { buildAppointment } from "../helpers/appointments";
import { useAppointmentScheduling } from "../hooks/useAppointmentScheduling";
import { useUserCoupons } from "../hooks/useUserCoupons";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
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
  const { coupons, loading: loadingCoupons } = useUserCoupons(user?.uid);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
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

      // Add coupon information if a coupon is selected
      if (selectedCoupon) {
        appointmentData.couponId = selectedCoupon.id;
        appointmentData.couponAssignmentId = selectedCoupon.assignmentId;
        appointmentData.discountPercentage = selectedCoupon.discountPercentage;
      }

      const appointment = buildAppointment(appointmentData);
      
      if (appointment) {
        const result = await saveAppointment(appointment);
        if (result.success) {
          // If a coupon was used, update its status
          if (selectedCoupon) {
            await updateDoc(doc(db, "couponAssignments", selectedCoupon.assignmentId), {
              status: "used",
              usedAt: new Date().toISOString(),
              appointmentId: result.appointmentId
            });
          }
          resetScheduling();
          setSelectedCoupon(null);
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
        <>
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

          {!loadingCoupons && coupons.length > 0 && (
            <div className={styles.formGroup}>
              <label>¿Deseas usar un cupón de descuento?</label>
              <select
                value={selectedCoupon?.id || ""}
                onChange={(e) => {
                  const coupon = coupons.find(c => c.id === e.target.value);
                  setSelectedCoupon(coupon || null);
                }}
                className={styles.select}
              >
                <option value="">Sin cupón</option>
                {coupons.map(coupon => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} - {coupon.discountPercentage}% de descuento
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
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
