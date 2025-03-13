import { useState } from 'react';
import { AdminProtected } from "../../components/AdminProtected";
import { CreateCouponModal } from "../../components/CreateCouponModal";
import { CouponCard } from "../../components/CouponCard";
import { useCouponsList } from "../../hooks/useCouponsList";
import styles from "../../styles/Mochita.module.css";

const Coupons = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { 
    coupons, 
    loading, 
    error, 
    refreshCoupons
  } = useCouponsList();

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Gestión de Cupones</h1>
          <div className={styles.headerActions}>
            <button 
              className={styles.createButton}
              onClick={() => setShowCreateModal(true)}
            >
              Crear Nuevo Cupón
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Cargando...</div>
        ) : (
          <div className={styles.couponsList}>
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onUpdate={refreshCoupons}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCouponModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refreshCoupons();
          }}
        />
      )}
    </AdminProtected>
  );
};

export default Coupons; 