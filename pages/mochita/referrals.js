import { useState, useEffect } from 'react';
import { AdminProtected } from "../../components/AdminProtected";
import { collection, query, getDocs, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import styles from "../../styles/Mochita.module.css";

const ReferralsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralStats, setReferralStats] = useState([]);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        setLoading(true);
        
        // Get all referrals
        const referralsRef = collection(db, "referrals");
        const referralsSnapshot = await getDocs(referralsRef);
        const referrals = referralsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        // Count referrals by referrer
        const referrerCounts = referrals.reduce((acc, referral) => {
          if (referral.referrerId) {
            acc[referral.referrerId] = (acc[referral.referrerId] || 0) + 1;
          }
          return acc;
        }, {});

        // Get user details for referrers
        const usersRef = collection(db, "users");
        const referrerIds = Object.keys(referrerCounts).filter(id => id);
        
        const userPromises = referrerIds.map(async (referrerId) => {
          try {
            // Query by id field instead of document ID
            const userQuery = query(usersRef, where("id", "==", referrerId));
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              return {
                userId: referrerId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                referralCount: referrerCounts[referrerId]
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching user ${referrerId}:`, error);
            return null;
          }
        });

        const referrerStats = (await Promise.all(userPromises))
          .filter(Boolean)
          .sort((a, b) => b.referralCount - a.referralCount);

        setReferralStats(referrerStats);
      } catch (error) {
        console.error("Error fetching referral stats:", error);
        setError("Error al cargar las estadísticas de referidos");
      } finally {
        setLoading(false);
      }
    };

    fetchReferralStats();
  }, []);

  const fetchReferredUsers = async (referrerId) => {
    if (!referrerId) {
      console.error("No referrerId provided");
      return;
    }

    try {
      setModalLoading(true);
      setReferredUsers([]); // Clear previous results

      // Get all referrals for this referrer
      const referralsRef = collection(db, "referrals");
      const referralsQuery = query(referralsRef, where("referrerId", "==", referrerId));
      const referralsSnapshot = await getDocs(referralsQuery);
      const referrals = referralsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));

      // Get user details for each referred user
      const usersRef = collection(db, "users");
      const userPromises = referrals
        .filter(referral => referral.referredId)
        .map(async (referral) => {
          try {
            // Query by id field instead of document ID
            const userQuery = query(usersRef, where("id", "==", referral.referredId));
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              return {
                id: referral.referredId,
                firstName: userData.firstName || "N/A",
                lastName: userData.lastName || "N/A",
                email: userData.email || "N/A",
                referralDate: referral.createdAt ? new Date(referral.createdAt) : new Date()
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching user ${referral.referredId}:`, error);
            return null;
          }
        });

      const referredUsersData = (await Promise.all(userPromises)).filter(Boolean);
      setReferredUsers(referredUsersData);
    } catch (error) {
      console.error("Error fetching referred users:", error);
      setError("Error al cargar los clientes referidos");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCardClick = async (referrer) => {
    if (!referrer?.userId) {
      console.error("Invalid referrer data:", referrer);
      return;
    }
    setSelectedReferrer(referrer);
    setShowModal(true);
    await fetchReferredUsers(referrer.userId);
  };

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Referidos</h1>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : (
          <div className={styles.referralsList}>
            {referralStats.map((stat) => (
              <div 
                key={stat.userId} 
                className={styles.referralCard}
                onClick={() => handleCardClick(stat)}
              >
                <div className={styles.referralInfo}>
                  <h3>{stat.firstName} {stat.lastName}</h3>
                  <p className={styles.referralEmail}>{stat.email}</p>
                  <div className={styles.referralStats}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Referidos:</span>
                      <span className={styles.statValue}>{stat.referralCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedReferrer && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <h2>Clientes Referidos por {selectedReferrer.firstName} {selectedReferrer.lastName}</h2>
              <div className={styles.referredUsersList}>
                {modalLoading ? (
                  <div className={styles.loading}>
                    Cargando clientes referidos...
                  </div>
                ) : referredUsers.length === 0 ? (
                  <div className={styles.emptyState}>
                    No se encontraron clientes referidos para este cliente
                  </div>
                ) : (
                  referredUsers.map((user) => (
                    <div key={user.id} className={styles.referredUserItem}>
                      <div className={styles.referredUserInfo}>
                        <h3>{user.firstName} {user.lastName}</h3>
                        <p>{user.email}</p>
                        <p className={styles.referralDate}>
                          {new Date(user.referralDate).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminProtected>
  );
};

export default ReferralsPage; 