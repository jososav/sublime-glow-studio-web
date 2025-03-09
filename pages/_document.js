import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />
        <title>Sublime Glow Studio | Manicura y Pedicura Profesional</title>
        <meta
          name="description"
          content="Sublime Glow Studio ofrece los mejores servicios de manicure y pedicure en un ambiente relajante. Reserva tu cita y luce unas uñas perfectas."
        />
        <meta
          name="keywords"
          content="manicure, pedicure, uñas, nails, salón de uñas, esmaltado, nail art, spa de uñas, uñas acrílicas, cuidado de uñas, belleza de manos y pies"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
