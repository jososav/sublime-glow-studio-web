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