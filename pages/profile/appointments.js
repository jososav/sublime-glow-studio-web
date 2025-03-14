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
            ...doc.data(),
            date: doc.data().date.toDate()
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const getAppointmentStatus = (date) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    
    if (appointmentDate < now) {
      return { text: 'Completada', className: styles.completed };
    } else {
      return { text: 'Próxima', className: styles.upcoming };
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
              const status = getAppointmentStatus(appointment.date);
              return (
                <div key={appointment.id} className={styles.appointmentCard}>
                  <div className={styles.appointmentHeader}>
                    <span className={`${styles.status} ${status.className}`}>
                      {status.text}
                    </span>
                    <time dateTime={appointment.date.toISOString()}>
                      {formatDate(appointment.date)}
                    </time>
                  </div>
                  
                  <div className={styles.appointmentDetails}>
                    <h3>{appointment.service}</h3>
                    {appointment.couponUsed && (
                      <div className={styles.couponInfo}>
                        <span>Cupón aplicado: </span>
                        <strong>{appointment.couponUsed.code}</strong>
                        <span> ({appointment.couponUsed.discount}% descuento)</span>
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