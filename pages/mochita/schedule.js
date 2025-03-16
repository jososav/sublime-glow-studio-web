import { useState, useEffect } from 'react';
import { AdminProtected } from "../../components/AdminProtected";
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from "../../styles/Schedule.module.css";

const DAYS = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo"
};

const Schedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ start: "09:00", end: "17:00" });

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const scheduleDoc = await getDoc(doc(db, "configuration", "schedule"));
      if (scheduleDoc.exists()) {
        setSchedule(scheduleDoc.data());
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError("Error al cargar el horario");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, "configuration", "schedule"), schedule);
      alert("Horario guardado exitosamente");
    } catch (error) {
      console.error("Error saving schedule:", error);
      setError("Error al guardar el horario");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = () => {
    if (!selectedDay) return;
    
    const updatedSchedule = {
      ...schedule,
      [selectedDay]: [...(schedule[selectedDay] || []), newSlot]
    };
    
    setSchedule(updatedSchedule);
    setShowAddSlot(false);
    setNewSlot({ start: "09:00", end: "17:00" });
  };

  const handleRemoveSlot = (day, index) => {
    const updatedSchedule = {
      ...schedule,
      [day]: schedule[day].filter((_, i) => i !== index)
    };
    setSchedule(updatedSchedule);
  };

  const handleUpdateSlot = (day, index, field, value) => {
    const updatedSchedule = {
      ...schedule,
      [day]: schedule[day].map((slot, i) => 
        i === index ? { ...slot, [field]: value } : slot
      )
    };
    setSchedule(updatedSchedule);
  };

  const handleCopySchedule = (fromDay) => {
    if (!selectedDay || !schedule[fromDay]) return;
    
    const updatedSchedule = {
      ...schedule,
      [selectedDay]: [...schedule[fromDay]]
    };
    setSchedule(updatedSchedule);
  };

  if (loading) {
    return (
      <AdminProtected>
        <div className={styles.container}>
          <div className={styles.loading}>Cargando horario...</div>
        </div>
      </AdminProtected>
    );
  }

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Configuración de Horario</h1>
          <button
            className={styles.saveButton}
            onClick={handleSaveSchedule}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.scheduleGrid}>
          <div className={styles.daysList}>
            {Object.entries(DAYS).map(([day, label]) => (
              <div
                key={day}
                className={`${styles.dayCard} ${selectedDay === day ? styles.selected : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <h3>{label}</h3>
                <div className={styles.slots}>
                  {schedule[day]?.map((slot, index) => (
                    <div key={index} className={styles.slot}>
                      {slot.start} - {slot.end}
                    </div>
                  )) || <p className={styles.noSlots}>Sin horarios</p>}
                </div>
              </div>
            ))}
          </div>

          {selectedDay && (
            <div className={styles.dayConfig}>
              <h2>{DAYS[selectedDay]}</h2>
              
              <div className={styles.slotsList}>
                {schedule[selectedDay]?.map((slot, index) => (
                  <div key={index} className={styles.slotConfig}>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => handleUpdateSlot(selectedDay, index, 'start', e.target.value)}
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => handleUpdateSlot(selectedDay, index, 'end', e.target.value)}
                    />
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveSlot(selectedDay, index)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>

              {showAddSlot ? (
                <div className={styles.addSlotForm}>
                  <input
                    type="time"
                    value={newSlot.start}
                    onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                  />
                  <span>a</span>
                  <input
                    type="time"
                    value={newSlot.end}
                    onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                  />
                  <div className={styles.addSlotActions}>
                    <button
                      className={styles.cancelButton}
                      onClick={() => setShowAddSlot(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      className={styles.addButton}
                      onClick={handleAddSlot}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={styles.addSlotButton}
                  onClick={() => setShowAddSlot(true)}
                >
                  Agregar Horario
                </button>
              )}

              <div className={styles.copySchedule}>
                <h3>Copiar horario desde:</h3>
                <div className={styles.copyButtons}>
                  {Object.entries(DAYS)
                    .filter(([day]) => day !== selectedDay && schedule[day]?.length > 0)
                    .map(([day, label]) => (
                      <button
                        key={day}
                        className={styles.copyButton}
                        onClick={() => handleCopySchedule(day)}
                      >
                        {label}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminProtected>
  );
};

export default Schedule; 