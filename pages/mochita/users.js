import { useState, useRef, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AdminProtected } from "../../components/AdminProtected";
import styles from "../../styles/Users.module.css";
import { useUsers } from "../../hooks/useUsers";
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";

// ... CreateUserModal component (unchanged)
const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: null
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const handleCreateUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError("Por favor, completa todos los campos obligatorios");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        Math.random().toString(36).slice(-8) // Random temporary password
      );

      // Send password reset email
      await sendPasswordResetEmail(auth, formData.email);

      // Create the user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        birthday: formData.birthday ? formData.birthday.toISOString() : null,
        role: "user"
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
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
    <div className={styles.modalOverlay}>
      <div ref={modalRef} className={styles.modal}>
        <h2>Crear Nuevo Usuario</h2>
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Nombre*:</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            placeholder="Ingresa el nombre"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Apellido*:</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            placeholder="Ingresa el apellido"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Email*:</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Ingresa el email"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Teléfono*:</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Ingresa el teléfono"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Fecha de Nacimiento:</label>
          <DatePicker
            selected={formData.birthday}
            onChange={(date) => setFormData(prev => ({ ...prev, birthday: date }))}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            placeholderText="Selecciona la fecha de nacimiento"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
          />
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
            disabled={isCreating}
          >
            Cancelar
          </button>
          <button
            className={styles.createButton}
            onClick={handleCreateUser}
            disabled={isCreating}
          >
            {isCreating ? "Creando..." : "Crear Usuario"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ... UserCard component (unchanged)
const UserCard = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    birthday: user.birthday ? new Date(user.birthday) : null
  });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  const handleUpdate = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError("Por favor, completa todos los campos obligatorios");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await setDoc(doc(db, "users", user.id), {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthday: formData.birthday ? formData.birthday.toISOString() : null
      }, { merge: true });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert("Se ha enviado un correo de restablecimiento de contraseña");
    } catch (error) {
      console.error("Error sending password reset:", error);
      alert("Error al enviar el correo de restablecimiento");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div 
      ref={cardRef}
      className={`${styles.userCard} ${updating ? styles.updating : ''}`}
    >
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {isEditing ? (
        <>
          <div className={styles.formGroup}>
            <label>Nombre:</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Apellido:</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Teléfono:</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Fecha de Nacimiento:</label>
            <DatePicker
              selected={formData.birthday}
              onChange={(date) => setFormData(prev => ({ ...prev, birthday: date }))}
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
              placeholderText="Selecciona la fecha de nacimiento"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
            />
          </div>

          <div className={styles.cardActions}>
            <button 
              className={styles.cancelButton}
              onClick={() => setIsEditing(false)}
              disabled={updating}
            >
              Cancelar
            </button>
            <button
              className={styles.saveButton}
              onClick={handleUpdate}
              disabled={updating}
            >
              {updating ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.userInfo}>
            <h3>{user.firstName} {user.lastName}</h3>
            <p>📱 {user.phone}</p>
            <p>📧 {user.email}</p>
            {user.birthday && (
              <p>🎂 {new Date(user.birthday).toLocaleDateString("es-ES")}</p>
            )}
          </div>

          <div className={styles.cardActions}>
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Editar
            </button>
            <button
              className={styles.resetButton}
              onClick={handleSendPasswordReset}
            >
              Restablecer Contraseña
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const Users = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { users, refreshUsers } = useUsers();

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Usuarios</h1>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Crear Nuevo Usuario
          </button>
        </div>

        <div className={styles.usersList}>
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
            />
          ))}
        </div>

        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={refreshUsers}
          />
        )}
      </div>
    </AdminProtected>
  );
};

export default Users; 