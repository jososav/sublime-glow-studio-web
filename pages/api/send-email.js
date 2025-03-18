import nodemailer from 'nodemailer';
import { initAdmin, getAdminAuth, getAdminDb } from '../../config/firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin at the start
try {
  initAdmin();
  console.log('Firebase Admin initialized in API route');
} catch (error) {
  console.error('Failed to initialize Firebase Admin:', error);
}

// Simple in-memory rate limiting
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 2 * 60 * 1000; // 2 minutes
const MAX_REQUESTS = 5;

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userRequests = rateLimit.get(ip) || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
};

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Content length validation
const isValidContentLength = (text, html) => {
  const maxLength = 100 * 1024; // 100KB
  return text.length <= maxLength && html.length <= maxLength;
};

// Allowed domains
const ALLOWED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'aol.com',
  'live.com',
  'msn.com'
];

const isAllowedDomain = (email) => {
  const domain = email.split('@')[1];
  return ALLOWED_DOMAINS.includes(domain);
};

// Create transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD // Use App Password instead of regular password
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { to, subject, text, html, token } = req.body;

    console.log('Received request:', {
      to,
      subject,
      hasToken: !!token,
      tokenLength: token?.length
    });

    // Validate required fields
    if (!to || !subject || !text || !html || !token) {
      console.error('Missing required fields:', { to, subject, hasText: !!text, hasHtml: !!html, hasToken: !!token });
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate email format
    if (!isValidEmail(to)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate content length
    if (!isValidContentLength(text, html)) {
      return res.status(400).json({ message: 'Content too long' });
    }

    // Validate domain
    if (!isAllowedDomain(to)) {
      return res.status(400).json({ message: 'Email domain not allowed' });
    }

    // Verify Firebase token
    try {
      console.log('Verifying token...');
      const adminAuth = getAdminAuth();
      
      if (!adminAuth) {
        console.error('Admin Auth not initialized. Checking environment variables...');
        console.log('FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
        console.log('FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
        console.log('FIREBASE_PRIVATE_KEY:', !!process.env.FIREBASE_PRIVATE_KEY);
        return res.status(500).json({ message: 'Error de configuración del servidor. Por favor, verifica las variables de entorno.' });
      }

      let decodedToken;
      try {
        // First try to verify as a regular ID token
        decodedToken = await adminAuth.verifyIdToken(token, true);
      } catch (error) {
        if (error.code === 'auth/id-token-expired' || error.code === 'auth/invalid-id-token') {
          // If it's not a valid ID token, try to verify as a custom token
          try {
            // For custom tokens, we need to sign in with the token first
            const userCredential = await adminAuth.signInWithCustomToken(token);
            decodedToken = userCredential.user;
          } catch (customError) {
            console.error('Custom token verification failed:', customError);
            throw customError;
          }
        } else {
          throw error;
        }
      }

      console.log('Token verified for user:', decodedToken.email);

      const userId = decodedToken.uid;

      // Allow sending to the authenticated user's email or the admin email
      // For admin tokens, allow sending to any email
      if (decodedToken.email !== 'admin@firebase.internal' && to !== decodedToken.email && to !== 'carolvek52@gmail.com') {
        console.log('Unauthorized email attempt:', to, 'by user:', decodedToken.email);
        return res.status(403).json({ message: 'No tienes permiso para enviar emails a esta dirección' });
      }

      // Only apply rate limiting for non-admin users
      if (decodedToken.email !== 'admin@firebase.internal') {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!checkRateLimit(ip)) {
          return res.status(429).json({ message: 'Too many requests, please try again later.' });
        }
      }

      // Check user's email sending limit
      const adminDb = getAdminDb();
      if (!adminDb) {
        console.error('Admin DB not initialized');
        return res.status(500).json({ message: 'Error de configuración del servidor' });
      }

      try {
        // Send email first
        console.log('Sending email to:', to);
        await transporter.sendMail({
          from: `"Sublime Glow Studio" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          text,
          html
        });

        // Then log the email
        await adminDb.collection('emailLogs').add({
          userId,
          to,
          subject,
          timestamp: FieldValue.serverTimestamp()
        });

        return res.status(200).json({ message: 'Email enviado exitosamente' });
      } catch (error) {
        console.error('Error in email process:', error);
        // If email was sent but logging failed, still return success
        if (error.message.includes('emailLogs')) {
          return res.status(200).json({ 
            message: 'Email enviado exitosamente, pero hubo un error al registrar el log' 
          });
        }
        // If email sending failed, return error
        return res.status(500).json({ message: 'Error al enviar el email' });
      }
    } catch (error) {
      console.error('Authentication error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/id-token-expired') {
        return res.status(401).json({ message: 'Sesión expirada. Por favor, vuelve a iniciar sesión.' });
      }
      if (error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ message: 'Token inválido. Por favor, vuelve a iniciar sesión.' });
      }
      if (error.code === 'auth/argument-error') {
        return res.status(401).json({ message: 'Token malformado. Por favor, vuelve a iniciar sesión.' });
      }
      if (error.code === 'auth/network-request-failed') {
        return res.status(503).json({ message: 'Error de conexión. Por favor, intenta de nuevo.' });
      }
      return res.status(401).json({ message: 'Error de autenticación. Por favor, vuelve a iniciar sesión.' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error al enviar el email' });
  }
} 