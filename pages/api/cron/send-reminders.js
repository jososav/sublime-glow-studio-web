import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { initAdmin, getAdminAuth, getAdminDb } from '../../../config/firebase-admin';
import nodemailer from 'nodemailer';
import { FieldValue } from "firebase/firestore";

// Initialize Firebase Admin
initAdmin();

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const appointmentReminderTemplate = (appointment, userData) => {
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
    subject: `Recordatorio: Tu cita es mañana - ${formatDate(appointment.date)}`,
    text: `
¡Hola ${userData?.name || 'Usuario'}!

Este es un recordatorio de tu cita mañana en Sublime Glow Studio.

Detalles de la cita:
📅 Fecha: ${formatDate(appointment.date)}
🕒 Hora: ${formatTime(appointment.startTime)}
💆‍♀️ Servicio: ${appointment.service}
${appointment.couponId ? `🎫 Cupón aplicado: ${appointment.discountPercentage}% de descuento` : ''}

Por favor, asegúrate de llegar a tiempo para tu cita.

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
    <img src="https://sublimeglowstudio.com/logo.png" alt="Sublime Glow Studio Logo" class="logo">
    <h1 style="color: #ec4899;">Recordatorio de Cita</h1>
  </div>

  <div class="content">
    <p>¡Hola ${userData?.name || 'Usuario'}!</p>
    <p>Este es un recordatorio de tu cita mañana en Sublime Glow Studio.</p>
  </div>

  <div class="details">
    <h2>Detalles de la cita:</h2>
    <div class="detail-item">📅 <strong>Fecha:</strong> ${formatDate(appointment.date)}</div>
    <div class="detail-item">🕒 <strong>Hora:</strong> ${formatTime(appointment.startTime)}</div>
    <div class="detail-item">💆‍♀️ <strong>Servicio:</strong> ${appointment.service}</div>
    ${appointment.couponId ? `<div class="detail-item">🎫 <strong>Cupón aplicado:</strong> ${appointment.discountPercentage}% de descuento</div>` : ''}
  </div>

  <div class="content">
    <p>Por favor, asegúrate de llegar a tiempo para tu cita.</p>
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

export default async function handler(req, res) {
  console.log('Cron job started at:', new Date().toISOString());
  console.log('Authorization header:', req.headers.authorization);
  console.log('Expected authorization:', `Bearer ${process.env.CRON_SECRET_KEY}`);
  
  // In development, allow the request without authorization
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode - skipping authorization check');
  } else {
    // Verify the request is from Vercel Cron
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      console.log('Unauthorized request - invalid CRON_SECRET_KEY');
      return res.status(401).json({ 
        error: 'Unauthorized',
        details: 'Invalid CRON_SECRET_KEY',
        received: req.headers.authorization,
        expected: `Bearer ${process.env.CRON_SECRET_KEY}`
      });
    }
  }

  try {
    // Get tomorrow's date in Costa Rica timezone (UTC-6)
    const now = new Date();
    // Adjust for Costa Rica timezone (UTC-6)
    const costaRicaOffset = -6 * 60 * 60 * 1000; // -6 hours in milliseconds
    const costaRicaNow = new Date(now.getTime() + costaRicaOffset);
    const tomorrow = new Date(costaRicaNow);
    tomorrow.setDate(costaRicaNow.getDate() + 1);
    
    // Format the date in YYYY-MM-DD
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log('Current UTC time:', now.toISOString());
    console.log('Current Costa Rica time:', new Date(now.getTime() + costaRicaOffset).toISOString());
    console.log('Looking for appointments on:', tomorrowStr);

    // Query confirmed appointments for tomorrow
    const appointmentsRef = collection(db, "appointments");
    const q = query(
      appointmentsRef,
      where("date", "==", tomorrowStr),
      where("status", "==", "confirmed")
    );

    const querySnapshot = await getDocs(q);
    console.log('Found appointments:', querySnapshot.size);
    
    // Collect all unique user IDs
    const userIds = new Set();
    querySnapshot.docs.forEach(doc => {
      userIds.add(doc.data().userId);
    });

    // Batch fetch users
    const usersData = {};
    const userPromises = Array.from(userIds).map(async userId => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        usersData[userId] = userDoc.data();
      }
    });

    await Promise.all(userPromises);

    // Get admin DB for logging
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error('Admin DB not initialized');
    }

    // Send reminder emails with delay between each
    console.log('Starting to send emails...');
    const results = [];
    for (const doc of querySnapshot.docs) {
      const appointmentData = doc.data();
      const userData = usersData[appointmentData.userId];

      if (appointmentData.email && userData) {
        const emailData = appointmentReminderTemplate(appointmentData, userData);
        try {
          // Add a 2-second delay between each email
          await delay(2000);

          // Send email directly using nodemailer
          await transporter.sendMail({
            from: `"Sublime Glow Studio" <${process.env.EMAIL_USER}>`,
            to: appointmentData.email,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html
          });

          // Log the email
          await adminDb.collection('emailLogs').add({
            userId: 'admin',
            to: appointmentData.email,
            subject: emailData.subject,
            timestamp: FieldValue.serverTimestamp()
          });

          console.log('Sent reminder email to:', appointmentData.email);
          results.push({ success: true, email: appointmentData.email });
        } catch (error) {
          console.error('Error sending reminder email:', error);
          results.push({ success: false, email: appointmentData.email, error: error.message });
          // Continue with other emails even if one fails
        }
      }
    }

    const successfulEmails = results.filter(r => r.success).length;
    const failedEmails = results.filter(r => !r.success).length;

    return res.status(200).json({ 
      success: true, 
      message: `Sent ${successfulEmails} reminder emails (${failedEmails} failed)`,
      timestamp: new Date().toISOString(),
      targetDate: tomorrowStr,
      currentCostaRicaTime: new Date(now.getTime() + costaRicaOffset).toISOString(),
      results
    });
  } catch (error) {
    console.error('Error in send-reminders:', error);
    return res.status(500).json({ 
      error: 'Error sending reminders',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 