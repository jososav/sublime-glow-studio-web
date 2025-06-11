import { useState } from "react";
import { useReferrals } from "../hooks/useReferrals";
import styles from "../styles/ReferralSection.module.css";

export const ReferralSection = ({ userId }) => {
  const { referrals, loading, error } = useReferrals(userId);
  const [copied, setCopied] = useState(false);
  const referralLink = `${window.location.origin}/referidos/${userId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Programa de Referidos</h2>
      
      <div className={styles.linkSection}>
        <p>Comparte este enlace con tus amigos:</p>
        <div className={styles.linkContainer}>
          <input
            type="text"
            value={referralLink}
            readOnly
            className={styles.linkInput}
          />
          <button
            onClick={handleCopyLink}
            className={styles.copyButton}
          >
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
      </div>

      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <h3>Total Referidos</h3>
          <p className={styles.statNumber}>{referrals.length}</p>
        </div>
      </div>

      <div className={styles.referralsList}>
        <h3>Clientes Referidos</h3>
        
        {loading ? (
          <p className={styles.loading}>Cargando referidos...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : referrals.length === 0 ? (
          <p className={styles.empty}>Aún no has referido a ningún cliente</p>
        ) : (
          <div className={styles.list}>
            {referrals.map((referral) => (
              <div key={referral.id} className={styles.referralItem}>
                <div className={styles.userInfo}>
                  <p className={styles.userName}>
                    {referral.referredUser.firstName} {referral.referredUser.lastName}
                  </p>
                  <p className={styles.userEmail}>{referral.referredUser.email}</p>
                </div>
                <p className={styles.date}>
                  {new Date(referral.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 