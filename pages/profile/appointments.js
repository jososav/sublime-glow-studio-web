import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthentication } from "../../providers/Authentication/authentication";
import { useAppointmentsList } from "../../hooks/useAppointmentsList";
import { formatDate, formatTime } from "../../helpers/dateFormatters";
import { toast } from "react-hot-toast";
import Head from 'next/head';
import styles from './Profile.module.css';

export default function Appointments() {
  const router = useRouter();
  const { user } = useAuthentication();
  const { appointments, loading, error, handleCancelAppointment } = useAppointmentsList(user?.uid);

  useEffect(() => {
    if (!user) {
      const currentPath = router.asPath;
      router.push(`/signin?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Error al cargar las citas: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Historial de Citas | Sublime Glow Studio</title>
        <meta name="description" content="Revisa tu historial de citas y próximas citas en Sublime Glow Studio" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Mis Citas</h1>
          <p className={styles.subtitle}>
            Aquí puedes ver y gestionar tus citas pendientes y confirmadas
          </p>

          {appointments.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tienes citas pendientes ni confirmadas</p>
              <button
                onClick={() => router.push("/appointments")}
                className={styles.createButton}
              >
                Crear una nueva cita
              </button>
            </div>
          ) : (
            <div className={styles.appointmentsGrid}>
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={styles.appointmentCard}
                >
                  <div className={styles.appointmentHeader}>
                    <div>
                      <h3 className={styles.serviceName}>
                        {appointment.serviceData?.name || appointment.service}
                      </h3>
                      <p className={styles.dateTime}>
                        {formatDate(appointment.date)} - {formatTime(appointment.startTime)}
                      </p>
                    </div>
                    <span
                      className={`${styles.status} ${
                        appointment.status === "confirmed"
                          ? styles.confirmed
                          : styles.pending
                      }`}
                    >
                      {appointment.status === "confirmed" ? "Confirmada" : "Pendiente"}
                    </span>
                  </div>

                  {appointment.couponId && (
                    <div className={styles.couponInfo}>
                      <p>
                        Cupón aplicado: {appointment.discountPercentage}% de descuento
                      </p>
                    </div>
                  )}

                  <div className={styles.actions}>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className={styles.cancelButton}
                    >
                      Cancelar cita
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 