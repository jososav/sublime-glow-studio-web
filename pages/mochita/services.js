import { useState, useEffect } from 'react';
import { AdminProtected } from "../../components/AdminProtected";
import { collection, doc, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from "../../styles/Services.module.css";

const ServiceModal = ({ isOpen, onClose, service, onSave }) => {
  const [name, setName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setDurationMinutes(service.durationMinutes.toString());
    } else {
      setName('');
      setDurationMinutes('');
    }
    setError('');
  }, [service]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('El nombre del servicio es requerido');
      return;
    }

    const duration = parseInt(durationMinutes);
    if (isNaN(duration) || duration < 15) {
      setError('La duración debe ser al menos 15 minutos');
      return;
    }

    onSave({
      name: name.trim(),
      durationMinutes: duration
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{service ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nombre del Servicio</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte de Pelo"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="duration">Duración (minutos)</label>
            <input
              id="duration"
              type="number"
              min="15"
              step="5"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              placeholder="Ej: 30"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={!name.trim() || !durationMinutes}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesList);
      setError('');
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleSaveService = async (serviceData) => {
    try {
      const servicesCollection = collection(db, 'services');
      if (selectedService) {
        // Update existing service
        await setDoc(doc(servicesCollection, selectedService.id), serviceData);
      } else {
        // Create new service
        await setDoc(doc(servicesCollection), serviceData);
      }
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Error al guardar el servicio');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'services', serviceId));
      fetchServices();
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Error al eliminar el servicio');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Cargando servicios...</div>;
  }

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Servicios</h1>
          <button className={styles.createButton} onClick={handleCreateService}>
            Agregar Servicio
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay servicios configurados</p>
            <button className={styles.createButton} onClick={handleCreateService}>
              Agregar Primer Servicio
            </button>
          </div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceInfo}>
                  <h3>{service.name}</h3>
                  <p>Duración: {service.durationMinutes} minutos</p>
                </div>
                <div className={styles.serviceActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditService(service)}
                  >
                    Editar
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          service={selectedService}
          onSave={handleSaveService}
        />
      </div>
    </AdminProtected>
  );
};

export default Services; 