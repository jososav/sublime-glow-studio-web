import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthentication } from '../../providers/Authentication/authentication';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from './Profile.module.css';

const AppointmentsPage = () => {
  const { user, loading } = useAuthentication();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    const fetchAppointments = async () => {
      if (user) {
        try {
          const appointmentsRef = collection(db, 'appointments');
          const q = query(
            appointmentsRef,
            where('userId', '==', user.uid),
            orderBy('date', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          const appointmentsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setAppointments(appointmentsData);
        } catch (err) {
          console.error('Error fetching appointments:', err);
          setError('Error al cargar las citas');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [user, loading, router]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no especificada";
    try {
      // The date is stored in YYYY-MM-DD format
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString("es-ES", {
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

  const getAppointmentStatus = (appointment) => {
    const status = appointment.status || 'pending';
    
    switch (status.toLowerCase()) {
      case 'finalized':
        return { text: 'Finalizada', className: styles.finalized };
      case 'cancelled':
        return { text: 'Cancelada', className: styles.cancelled };
      case 'confirmed':
        return { text: 'Confirmada', className: styles.confirmed };
      case 'pending':
      default:
        return { text: 'Pendiente', className: styles.pending };
    }
  };

  if (loading || isLoading) return <div>Cargando...</div>;
  if (!user) return null;

  return (
    <>
      <Head>
        <title>Historial de Citas | Sublime Glow Studio</title>
        <meta name="description" content="Revisa tu historial de citas y próximas citas en Sublime Glow Studio" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.title}>Historial de Citas</h1>

        {error && <div className={styles.error}>{error}</div>}

        {appointments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No tienes citas registradas</p>
          </div>
        ) : (
          <div className={styles.appointmentsList}>
            {appointments.map((appointment) => {
              const status = getAppointmentStatus(appointment);
              return (
                <div key={appointment.id} className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <span className={`${styles.status} ${status.className}`}>
                      {status.text}
                    </span>
                    <time dateTime={appointment.date}>
                      {formatDate(appointment.date)}
                    </time>
                  </div>
                  
                  <div className={styles.appointmentDetails}>
                    <h3>{appointment.service}</h3>
                    <p className={styles.time}>Hora: {formatTime(appointment.startTime)}</p>
                    {appointment.couponId && (
                      <div className={styles.couponInfo}>
                        <span>Cupón aplicado con </span>
                        <strong>{appointment.discountPercentage}% de descuento</strong>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <p className={styles.notes}>{appointment.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentsPage; 