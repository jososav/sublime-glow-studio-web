import styles from './serviceSelection.module.css';

const ServiceCard = ({ service, isSelected, onClick }) => (
  <div 
    className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
    onClick={onClick}
  >
    <h3>{service.name}</h3>
    <div className={styles.serviceDetails}>
      <span>⏱️ {service.durationMinutes} minutos</span>
    </div>
    {service.description && (
      <p className={styles.serviceDescription}>{service.description}</p>
    )}
  </div>
);

const ServiceSelection = ({ services, selectedService, onServiceSelect }) => {
  return (
    <div className={styles.formGroup}>
      <label>Servicio:</label>
      <div className={styles.servicesGrid}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onClick={() => onServiceSelect(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceSelection; 