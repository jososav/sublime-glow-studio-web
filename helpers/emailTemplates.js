export const appointmentCreatedTemplate = (appointment, userData) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no especificada";
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatTime = (time) => {
    if (!time) return "Hora no especificada";
    return time.slice(0, 5);
  };

  return {
    subject: `Cita creada en Sublime Glow Studio - ${formatDate(appointment.date)}`,
    text: `
¡Hola ${userData?.name || 'Usuario'}!

Tu cita ha sido creada exitosamente en Sublime Glow Studio.

Detalles de la cita:
📅 Fecha: ${formatDate(appointment.date)}
🕒 Hora: ${formatTime(appointment.startTime)}
💆‍♀️ Servicio: ${appointment.service}
${appointment.couponId ? `🎫 Cupón aplicado: ${appointment.discountPercentage}% de descuento` : ''}

Estado actual: Pendiente de confirmación

Recibirás un correo electrónico cuando tu cita sea confirmada.

Si necesitas hacer algún cambio o tienes alguna pregunta, no dudes en contactarnos.

¡Gracias por elegir Sublime Glow Studio!

Saludos,
El equipo de Sublime Glow Studio
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .details {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .detail-item {
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #fff3cd;
      color: #856404;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://sublimeglowstudio.com/logo.jpeg" alt="Sublime Glow Studio Logo" class="logo">
    <h1>¡Tu cita ha sido creada!</h1>
  </div>

  <div class="content">
    <p>¡Hola ${userData?.name || 'Usuario'}!</p>
    <p>Tu cita ha sido creada exitosamente en Sublime Glow Studio.</p>
  </div>

  <div class="details">
    <h2>Detalles de la cita:</h2>
    <div class="detail-item">📅 <strong>Fecha:</strong> ${formatDate(appointment.date)}</div>
    <div class="detail-item">🕒 <strong>Hora:</strong> ${formatTime(appointment.startTime)}</div>
    <div class="detail-item">💆‍♀️ <strong>Servicio:</strong> ${appointment.service}</div>
    ${appointment.couponId ? `<div class="detail-item">🎫 <strong>Cupón aplicado:</strong> ${appointment.discountPercentage}% de descuento</div>` : ''}
    <div class="detail-item">
      <strong>Estado actual:</strong> <span class="status">Pendiente de confirmación</span>
    </div>
  </div>

  <div class="content">
    <p>Recibirás un correo electrónico cuando tu cita sea confirmada.</p>
    <p>Si necesitas hacer algún cambio o tienes alguna pregunta, no dudes en contactarnos.</p>
  </div>

  <div class="footer">
    <p>¡Gracias por elegir Sublime Glow Studio!</p>
    <p>Saludos,<br>El equipo de Sublime Glow Studio</p>
  </div>
</body>
</html>
    `
  };
};

export const appointmentCreatedAdminTemplate = (appointment, userData) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no especificada";
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatTime = (time) => {
    if (!time) return "Hora no especificada";
    return time.slice(0, 5);
  };

  return {
    subject: `Nueva cita pendiente - ${formatDate(appointment.date)}`,
    text: `
Nueva cita pendiente de confirmación

Detalles de la cita:
📅 Fecha: ${formatDate(appointment.date)}
🕒 Hora: ${formatTime(appointment.startTime)}
💆‍♀️ Servicio: ${appointment.service}
👤 Cliente: ${userData?.name || 'No especificado'}
📧 Email: ${appointment.email}
📱 Teléfono: ${userData?.phone || 'No especificado'}
${appointment.couponId ? `🎫 Cupón aplicado: ${appointment.discountPercentage}% de descuento` : ''}

Por favor, revisa y confirma la cita lo antes posible.
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .details {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .detail-item {
      margin-bottom: 10px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://sublimeglowstudio.com/logo.jpeg" alt="Sublime Glow Studio Logo" class="logo">
    <h1 style="color: #e91e63;">Nueva Cita Pendiente</h1>
  </div>

  <div class="content">
    <p>Se ha creado una nueva cita que requiere confirmación.</p>
  </div>

  <div class="details">
    <h2>Detalles de la cita:</h2>
    <div class="detail-item">📅 <strong>Fecha:</strong> ${formatDate(appointment.date)}</div>
    <div class="detail-item">🕒 <strong>Hora:</strong> ${formatTime(appointment.startTime)}</div>
    <div class="detail-item">💆‍♀️ <strong>Servicio:</strong> ${appointment.service}</div>
    <div class="detail-item">👤 <strong>Cliente:</strong> ${userData?.name || 'No especificado'}</div>
    <div class="detail-item">📧 <strong>Email:</strong> ${appointment.email}</div>
    <div class="detail-item">📱 <strong>Teléfono:</strong> ${userData?.phone || 'No especificado'}</div>
    ${appointment.couponId ? `<div class="detail-item">🎫 <strong>Cupón aplicado:</strong> ${appointment.discountPercentage}% de descuento</div>` : ''}
  </div>

  <div class="footer">
    <p>Por favor, revisa y confirma la cita lo antes posible.</p>
  </div>
</body>
</html>
`
  };
};

export const appointmentConfirmedTemplate = (appointment, userData) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no especificada";
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatTime = (time) => {
    if (!time) return "Hora no especificada";
    return time.slice(0, 5);
  };

  return {
    subject: `¡Tu cita ha sido confirmada! - ${formatDate(appointment.date)}`,
    text: `
¡Hola ${userData?.name || 'Usuario'}!

Tu cita ha sido confirmada en Sublime Glow Studio.

Detalles de la cita:
📅 Fecha: ${formatDate(appointment.date)}
🕒 Hora: ${formatTime(appointment.startTime)}
💆‍♀️ Servicio: ${appointment.service}
${appointment.couponId ? `🎫 Cupón aplicado: ${appointment.discountPercentage}% de descuento` : ''}

Estado: Confirmada ✅

Si necesitas hacer algún cambio o tienes alguna pregunta, no dudes en contactarnos.

¡Gracias por elegir Sublime Glow Studio!

Saludos,
El equipo de Sublime Glow Studio
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .details {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .detail-item {
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #d4edda;
      color: #155724;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://sublimeglowstudio.com/logo.jpeg" alt="Sublime Glow Studio Logo" class="logo">
    <h1 style="color: #28a745;">¡Tu cita ha sido confirmada!</h1>
  </div>

  <div class="content">
    <p>¡Hola ${userData?.name || 'Usuario'}!</p>
    <p>Tu cita ha sido confirmada en Sublime Glow Studio.</p>
  </div>

  <div class="details">
    <h2>Detalles de la cita:</h2>
    <div class="detail-item">📅 <strong>Fecha:</strong> ${formatDate(appointment.date)}</div>
    <div class="detail-item">🕒 <strong>Hora:</strong> ${formatTime(appointment.startTime)}</div>
    <div class="detail-item">💆‍♀️ <strong>Servicio:</strong> ${appointment.service}</div>
    ${appointment.couponId ? `<div class="detail-item">🎫 <strong>Cupón aplicado:</strong> ${appointment.discountPercentage}% de descuento</div>` : ''}
    <div class="detail-item">
      <strong>Estado:</strong> <span class="status">Confirmada ✅</span>
    </div>
  </div>

  <div class="content">
    <p>Si necesitas hacer algún cambio o tienes alguna pregunta, no dudes en contactarnos.</p>
  </div>

  <div class="footer">
    <p>¡Gracias por elegir Sublime Glow Studio!</p>
    <p>Saludos,<br>El equipo de Sublime Glow Studio</p>
  </div>
</body>
</html>
    `
  };
};

export const appointmentCancelledTemplate = (appointment, userData) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no especificada";
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatTime = (time) => {
    if (!time) return "Hora no especificada";
    return time.slice(0, 5);
  };

  return {
    subject: `Tu cita ha sido cancelada - ${formatDate(appointment.date)}`,
    text: `
¡Hola ${userData?.name || 'Usuario'}!

Tu cita ha sido cancelada en Sublime Glow Studio.

Detalles de la cita cancelada:
📅 Fecha: ${formatDate(appointment.date)}
🕒 Hora: ${formatTime(appointment.startTime)}
💆‍♀️ Servicio: ${appointment.service}
${appointment.couponId ? `🎫 Cupón aplicado: ${appointment.discountPercentage}% de descuento` : ''}

Estado: Cancelada ❌

Si deseas agendar una nueva cita, puedes hacerlo a través de nuestra página web.

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
El equipo de Sublime Glow Studio
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .details {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .detail-item {
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #f8d7da;
      color: #721c24;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://sublimeglowstudio.com/logo.jpeg" alt="Sublime Glow Studio Logo" class="logo">
    <h1 style="color: #dc3545;">Tu cita ha sido cancelada</h1>
  </div>

  <div class="content">
    <p>¡Hola ${userData?.name || 'Usuario'}!</p>
    <p>Tu cita ha sido cancelada en Sublime Glow Studio.</p>
  </div>

  <div class="details">
    <h2>Detalles de la cita cancelada:</h2>
    <div class="detail-item">📅 <strong>Fecha:</strong> ${formatDate(appointment.date)}</div>
    <div class="detail-item">🕒 <strong>Hora:</strong> ${formatTime(appointment.startTime)}</div>
    <div class="detail-item">💆‍♀️ <strong>Servicio:</strong> ${appointment.service}</div>
    ${appointment.couponId ? `<div class="detail-item">🎫 <strong>Cupón aplicado:</strong> ${appointment.discountPercentage}% de descuento</div>` : ''}
    <div class="detail-item">
      <strong>Estado:</strong> <span class="status">Cancelada ❌</span>
    </div>
  </div>

  <div class="content">
    <p>Si deseas agendar una nueva cita, puedes hacerlo a través de nuestra página web.</p>
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
  </div>

  <div class="footer">
    <p>Saludos,<br>El equipo de Sublime Glow Studio</p>
  </div>
</body>
</html>
    `
  };
};

export const appointmentCancelledAdminTemplate = (appointment, userData) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Fecha no especificada";
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatTime = (time) => {
    if (!time) return "Hora no especificada";
    return time.slice(0, 5);
  };

  return {
    subject: `Cita Cancelada - ${formatDate(appointment.date)}`,
    text: `
¡Hola Admin!

Un usuario ha cancelado su cita en Sublime Glow Studio.

Detalles de la cita cancelada:
👤 Cliente: ${userData?.name || 'Usuario no especificado'}
📧 Email: ${appointment.email || 'No especificado'}
📱 Teléfono: ${userData?.phone || 'No especificado'}
📅 Fecha: ${formatDate(appointment.date)}
🕒 Hora: ${formatTime(appointment.startTime)}
💆‍♀️ Servicio: ${appointment.service}
${appointment.couponId ? `🎫 Cupón aplicado: ${appointment.discountPercentage}% de descuento` : ''}

Estado: Cancelada ❌

Por favor, actualiza el estado de la cita en el sistema.

Saludos,
Sistema de Notificaciones
    `,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .details {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #eee;
    }
    .detail-item {
      margin-bottom: 10px;
    }
    .status {
      display: inline-block;
      padding: 5px 10px;
      border-radius: 4px;
      background-color: #f8d7da;
      color: #721c24;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="https://sublimeglowstudio.com/logo.jpeg" alt="Sublime Glow Studio Logo" class="logo">
    <h1 style="color: #dc3545;">Cita Cancelada</h1>
  </div>

  <div class="content">
    <p>¡Hola Admin!</p>
    <p>Un usuario ha cancelado su cita en Sublime Glow Studio.</p>
  </div>

  <div class="details">
    <h2>Detalles de la cita cancelada:</h2>
    <div class="detail-item">👤 <strong>Cliente:</strong> ${userData?.name || 'Usuario no especificado'}</div>
    <div class="detail-item">📧 <strong>Email:</strong> ${appointment.email || 'No especificado'}</div>
    <div class="detail-item">📱 <strong>Teléfono:</strong> ${userData?.phone || 'No especificado'}</div>
    <div class="detail-item">📅 <strong>Fecha:</strong> ${formatDate(appointment.date)}</div>
    <div class="detail-item">🕒 <strong>Hora:</strong> ${formatTime(appointment.startTime)}</div>
    <div class="detail-item">💆‍♀️ <strong>Servicio:</strong> ${appointment.service}</div>
    ${appointment.couponId ? `<div class="detail-item">🎫 <strong>Cupón aplicado:</strong> ${appointment.discountPercentage}% de descuento</div>` : ''}
    
    <div class="detail-item">
      <strong>Estado:</strong> <span class="status">Cancelada ❌</span>
    </div>
  </div>

  <div class="content">
    <p>Por favor, actualiza el estado de la cita en el sistema.</p>
  </div>

  <div class="footer">
    <p>Saludos,<br>Sistema de Notificaciones</p>
  </div>
</body>
</html>
    `
  };
}; 