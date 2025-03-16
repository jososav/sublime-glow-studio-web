import { useRouter } from "next/router";
import { AdminProtected } from "../../components/AdminProtected";
import styles from "../../styles/MochitaAdmin.module.css";

const AdminModuleCard = ({ title, description, icon, path }) => {
  const router = useRouter();

  return (
    <div 
      className={styles.moduleCard}
      onClick={() => router.push(path)}
    >
      <div className={styles.moduleIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const MochitaAdmin = () => {
  const adminModules = [
    {
      title: "Gestión de Citas",
      description: "Administra las citas y horarios de los servicios",
      icon: "📅",
      path: "/mochita/appointments"
    },
    {
      title: "Gestión de Usuarios",
      description: "Administra los usuarios y sus permisos",
      icon: "👥",
      path: "/mochita/users"
    },
    {
      title: "Gestión de Artículos",
      description: "Administra los artículos y contenido del blog",
      icon: "📝",
      path: "/mochita/articles"
    },
    {
      title: "Gestión de Cupones",
      description: "Administra los cupones de descuento",
      icon: "🎫",
      path: "/mochita/coupons"
    },
    {
      title: "Gestión de Referidos",
      description: "Visualiza y administra el programa de referidos",
      icon: "🤝",
      path: "/mochita/referrals"
    },
    {
      title: "Horario de Trabajo",
      description: "Configura los horarios de atención",
      icon: "⏰",
      path: "/mochita/schedule"
    },
    {
      title: "Servicios",
      description: "Administra los servicios disponibles",
      icon: "💅",
      path: "/mochita/services"
    }
  ];

  return (
    <AdminProtected>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Panel de Administración</h1>
        </div>
        <div className={styles.moduleGrid}>
          {adminModules.map((module) => (
            <AdminModuleCard
              key={module.path}
              {...module}
            />
          ))}
        </div>
      </div>
    </AdminProtected>
  );
};

export default MochitaAdmin; 