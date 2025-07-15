import styles from './serviceSelection.module.css';

const ServiceCard = ({ service, isSelected, onClick }) => (
  <div 
    className={`${styles.serviceCard} ${isSelected ? styles.selected : ''}`}
    onClick={onClick}
  >
    <h3>{service.name}</h3>
  </div>
);

const ServiceSelection = ({ services, selectedService, onServiceSelect }) => {
  return (
    <div className={styles.formGroup}>
      <label>Seleccionar servicio deseado:</label>
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