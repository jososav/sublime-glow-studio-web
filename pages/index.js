import Image from "next/image";
import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Manicure y Pedicure Profesional en Sublime Glow Studio</h1>
        
        <div className={styles.heroImage}>
          <Image
            src="/manipedi.jpg"
            alt="Servicios de manicure y pedicure profesional"
            width={320}
            height={320}
            style={{ borderRadius: '12px', objectFit: 'cover' }}
          />
        </div>

        <h2 className={styles.subtitle}>Realza la belleza de tus manos y pies</h2>

        <p className={styles.description}>
          Las uñas se moldean, las cutículas se cuidan y realizamos una
          preparación completa para obtener los mejores resultados. Puedes elegir
          entre esmalte tradicional o gel (semipermanente).
        </p>

        <h2 className={styles.subtitle}>Servicios de manicure y pedicure para cada estilo</h2>

        <p className={styles.description}>
          Recomendado para piel seca y pies con callosidades, como un tratamiento
          suave para restaurar la suavidad. Comienza con un baño de pies en sales
          minerales, las uñas se moldean, las cutículas se cuidan y se realiza un
          masaje con un exfoliante que deja la piel más suave. Puedes elegir entre
          esmalte tradicional o gel (semipermanente).
        </p>

        <Link href="/appointments" className={styles.ctaLink}>
          Reserva tu cita y luce unas uñas perfectas
        </Link>
      </div>
    </section>
  );
}
