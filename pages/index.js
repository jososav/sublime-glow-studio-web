import Image from "next/image";

import styles from "../styles/Home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <section className={styles.wrapper}>
      <h1>Manicure y Pedicure Profesional en Sublime Glow Studio</h1>

      <Image
        style={{ borderRadius: "50%" }}
        src="/manipedi.jpg"
        alt="manipedi"
        width="300"
        height="300"
      />

      <h2>Realza la belleza de tus manos y pies</h2>

      <p>
        Las uñas se moldean, las cutículas se cuidan y realizamos una
        preparación completa para obtener los mejores resultados. Puedes elegir
        entre esmalte tradicional o gel (semipermanente).
      </p>

      <h2>Servicios de manicure y pedicure para cada estilo</h2>

      <p>
        Recomendado para piel seca y pies con callosidades, como un tratamiento
        suave para restaurar la suavidad. Comienza con un baño de pies en sales
        minerales, las uñas se moldean, las cutículas se cuidan y se realiza un
        masaje con un exfoliante que deja la piel más suave. Puedes elegir entre
        esmalte tradicional o gel (semipermanente).
      </p>

      <Link href="/appointments">
        <h2 className={styles.link}>
          Reserva tu cita y luce unas uñas perfectas
        </h2>
      </Link>
    </section>
  );
}
