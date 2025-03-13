import { useEffect, useState } from 'react';
import { fetchServices } from '../../data/services/services';
import { formatDuration } from '../../helpers/time';
import styles from './servicesSection.module.css';

const ServiceCard = ({ service }) => (
  <div className={styles.serviceCard}>
    <h3>{service.name}</h3>
    <div className={styles.serviceDetails}>
      <span>⏱️ Duración: {formatDuration(service.durationMinutes)}</span>
    </div>
    {service.description && (
      <p className={styles.serviceDescription}>{service.description}</p>
    )}
  </div>
);

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const servicesData = await fetchServices();
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Cargando servicios...</div>;
  }

  return (
    <section className={styles.servicesSection}>
      <div className={styles.container}>
        <h2>Nuestros Servicios</h2>
        <p className={styles.sectionDescription}>
          Descubre nuestra variedad de servicios diseñados para realzar tu belleza natural
        </p>
        <div className={styles.servicesGrid}>
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection; 