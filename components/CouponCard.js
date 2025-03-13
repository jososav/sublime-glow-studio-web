import { useState, useRef, useEffect } from "react";
import { doc, updateDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { useUsers } from "../hooks/useUsers";
import styles from "../styles/Mochita.module.css";

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "used", label: "Usado" },
  { value: "expired", label: "Expirado" }
];

export const CouponCard = ({ coupon, onUpdate }) => {
  const { users } = useUsers();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentCounts, setAssignmentCounts] = useState({});
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [coupon.id]);

  const fetchAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const assignmentsRef = collection(db, "couponAssignments");
      const q = query(
        assignmentsRef, 
        where("couponId", "==", coupon.id),
        where("status", "==", "active")  // Only get active assignments
      );
      const snapshot = await getDocs(q);
      const assignmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignments(assignmentsData);

      // Calculate assignment counts per user (only active assignments)
      const counts = assignmentsData.reduce((acc, curr) => {
        acc[curr.userId] = (acc[curr.userId] || 0) + 1;
        return acc;
      }, {});
      setAssignmentCounts(counts);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setError(error.message);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === coupon.status) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      await updateDoc(doc(db, "coupons", coupon.id), {
        status: newStatus
      });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating coupon status:", error);
      setError(error.message);
    } finally {
      setUpdating(false);
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

  const handleAssignUsers = async () => {
    if (selectedUsers.length === 0) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const batch = writeBatch(db);
      const assignmentsRef = collection(db, "couponAssignments");

      // Create new assignments for all selected users
      for (const userId of selectedUsers) {
        const newAssignmentRef = doc(assignmentsRef);
        batch.set(newAssignmentRef, {
          couponId: coupon.id,
          userId,
          status: "active",
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      await fetchAssignments();
      setIsEditing(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error assigning users:", error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#10b981";
      case "used":
        return "#6366f1";
      case "expired":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status) => {
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status;
  };

  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  // Group assignments by user
  const assignmentsByUser = assignments.reduce((acc, assignment) => {
    if (!acc[assignment.userId]) {
      acc[assignment.userId] = [];
    }
    acc[assignment.userId].push(assignment);
    return acc;
  }, {});

  return (
    <div 
      ref={cardRef}
      className={`${styles.couponCard} ${updating ? styles.updating : ''} ${isEditing ? styles.editing : ''}`}
      onClick={() => !updating && !isEditing && setIsEditing(true)}
    >
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.couponHeader}>
        <div className={styles.couponCode}>{coupon.code}</div>
        <div 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(coupon.status) }}
        >
          {getStatusLabel(coupon.status)}
        </div>
      </div>

      <div className={styles.couponInfo}>
        <p>💰 {coupon.discountPercentage}% de descuento</p>
        {coupon.description && (
          <p>📝 {coupon.description}</p>
        )}
      </div>

      <div className={styles.assignmentsInfo}>
        <h4>Usuarios Asignados:</h4>
        {loadingAssignments ? (
          <p>Cargando asignaciones...</p>
        ) : Object.keys(assignmentsByUser).length === 0 ? (
          <p>No hay usuarios asignados</p>
        ) : (
          <div className={styles.assignmentsList}>
            {Object.entries(assignmentsByUser).map(([userId, userAssignments]) => {
              const user = getUserById(userId);
              return user ? (
                <div key={userId} className={styles.assignmentItem}>
                  <div className={styles.assignmentItemContent}>
                    <span className={styles.userName}>
                      {user.firstName} {user.lastName}
                    </span>
                    <span className={styles.userEmail}>
                      {user.email}
                    </span>
                  </div>
                  <span className={styles.assignmentCount}>
                    {userAssignments.length}x
                  </span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {isEditing && (
        <>
          <div className={styles.statusDropdown}>
            <h4>Cambiar Estado:</h4>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`${styles.statusOption} ${coupon.status === option.value ? styles.active : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(option.value);
                }}
                disabled={updating}
                style={{ 
                  backgroundColor: option.value === coupon.status ? getStatusColor(option.value) : 'transparent',
                  color: option.value === coupon.status ? 'white' : getStatusColor(option.value),
                  borderColor: getStatusColor(option.value)
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={styles.userAssignment}>
            <h4>Asignar Cupón a Usuarios:</h4>
            <div className={styles.usersList}>
              {users.map(user => (
                <div 
                  key={user.id} 
                  className={`${styles.userItem} ${
                    selectedUsers.includes(user.id) ? styles.selected : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserSelection(user.id);
                  }}
                >
                  <div className={styles.userItemContent}>
                    <span className={styles.userName}>
                      {user.firstName} {user.lastName}
                    </span>
                    <span className={styles.userEmail}>
                      {user.email}
                    </span>
                  </div>
                  {assignmentCounts[user.id] > 0 && (
                    <span className={styles.existingCount}>
                      Tiene {assignmentCounts[user.id]}
                    </span>
                  )}
                  {selectedUsers.includes(user.id) && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </div>
              ))}
            </div>
            {selectedUsers.length > 0 && (
              <button
                className={styles.assignButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAssignUsers();
                }}
                disabled={updating}
              >
                {updating ? "Asignando..." : `Asignar a ${selectedUsers.length} usuarios`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}; 