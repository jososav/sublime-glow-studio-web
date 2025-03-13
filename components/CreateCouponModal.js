import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useUsers } from "../hooks/useUsers";
import styles from "../styles/Mochita.module.css";
import modalStyles from "../styles/Modal.module.css";

export const CreateCouponModal = ({ onClose, onSuccess }) => {
  const { users, loading: loadingUsers, error: usersError } = useUsers();
  const [formData, setFormData] = useState({
    code: "",
    discountPercentage: "",
    description: ""
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userCounts, setUserCounts] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const handleCreateCoupon = async () => {
    if (!formData.code || !formData.discountPercentage) {
      setError("Por favor, completa los campos obligatorios");
      return;
    }

    const discount = parseInt(formData.discountPercentage);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      setError("El porcentaje de descuento debe ser un número entre 1 y 100");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const batch = writeBatch(db);
      
      // Create the base coupon
      const couponRef = await addDoc(collection(db, "coupons"), {
        code: formData.code.toUpperCase(),
        discountPercentage: discount,
        description: formData.description || "",
        createdAt: serverTimestamp(),
        status: "active"
      });

      // Create coupon assignments for selected users
      if (selectedUsers.length > 0) {
        const assignmentsRef = collection(db, "couponAssignments");
        
        // Create assignments based on user counts
        for (const userId of selectedUsers) {
          const count = userCounts[userId] || 1;
          for (let i = 0; i < count; i++) {
            const newAssignmentRef = doc(assignmentsRef);
            batch.set(newAssignmentRef, {
              couponId: couponRef.id,
              userId,
              status: "active",
              createdAt: serverTimestamp()
            });
          }
        }
        await batch.commit();
      }

      onSuccess();
    } catch (error) {
      console.error("Error creating coupon:", error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleUserCount = (userId, increment) => {
    setUserCounts(prev => {
      const currentCount = prev[userId] || 1;
      const newCount = Math.max(1, currentCount + increment);
      return {
        ...prev,
        [userId]: newCount
      };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className={modalStyles.modalOverlay}>
      <div ref={modalRef} className={modalStyles.modal}>
        <h2>Crear Nuevo Cupón</h2>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={modalStyles.formGroup}>
          <label>Código*:</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              code: e.target.value.toUpperCase() 
            }))}
            placeholder="Ej: WELCOME2024"
          />
        </div>

        <div className={modalStyles.formGroup}>
          <label>Porcentaje de Descuento*:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={formData.discountPercentage}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              discountPercentage: e.target.value 
            }))}
            placeholder="Ej: 15"
          />
        </div>

        <div className={modalStyles.formGroup}>
          <label>Descripción:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: e.target.value 
            }))}
            placeholder="Descripción opcional del cupón"
          />
        </div>

        <div className={modalStyles.formGroup}>
          <label>Asignar a Usuarios:</label>
          {loadingUsers ? (
            <div>Cargando usuarios...</div>
          ) : usersError ? (
            <div className={styles.errorMessage}>
              Error al cargar usuarios: {usersError}
            </div>
          ) : (
            <div className={modalStyles.usersList}>
              {users.map(user => (
                <div 
                  key={user.id} 
                  className={`${modalStyles.userItem} ${
                    selectedUsers.includes(user.id) ? modalStyles.selected : ''
                  }`}
                >
                  <div 
                    className={modalStyles.userItemContent}
                    onClick={() => handleUserSelection(user.id)}
                  >
                    <span className={modalStyles.userName}>
                      {user.firstName} {user.lastName}
                    </span>
                    <span className={modalStyles.userEmail}>
                      {user.email}
                    </span>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <div className={modalStyles.userControls}>
                      <button
                        className={modalStyles.countButton}
                        onClick={() => handleUserCount(user.id, -1)}
                      >
                        -
                      </button>
                      <span className={modalStyles.countDisplay}>
                        {userCounts[user.id] || 1}
                      </span>
                      <button
                        className={modalStyles.countButton}
                        onClick={() => handleUserCount(user.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {users?.length > 0 && selectedUsers.length > 0 && (
            <div className={modalStyles.selectedCount}>
              {selectedUsers.length} usuarios seleccionados - Total cupones: {
                selectedUsers.reduce((total, userId) => total + (userCounts[userId] || 1), 0)
              }
            </div>
          )}
        </div>

        <div className={modalStyles.modalActions}>
          <button 
            className={modalStyles.cancelButton} 
            onClick={onClose}
            disabled={isCreating}
          >
            Cancelar
          </button>
          <button
            className={modalStyles.submitButton}
            onClick={handleCreateCoupon}
            disabled={isCreating}
          >
            {isCreating ? "Creando..." : "Crear Cupón"}
          </button>
        </div>
      </div>
    </div>
  );
}; 