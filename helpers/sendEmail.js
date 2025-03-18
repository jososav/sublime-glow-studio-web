import { auth } from '../config/firebase';

export const sendEmail = async (to, subject, text, html) => {
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('No hay usuario autenticado');
    }

    // Get a fresh token
    console.log('Getting fresh token for user:', user.email);
    const token = await user.getIdToken(true);
    if (!token) {
      console.error('Failed to get ID token');
      throw new Error('Error al obtener el token de autenticación');
    }

    console.log('Sending email request to API...');
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        text,
        html,
        token
      }),
    });

    const data = await response.json();
    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      data
    });

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        console.error('Authentication error:', data.message);
        // Force a re-authentication
        await auth.signOut();
        throw new Error('Sesión expirada. Por favor, vuelve a iniciar sesión.');
      }
      if (response.status === 403) {
        console.error('Authorization error:', data.message);
        throw new Error('No tienes permiso para realizar esta acción');
      }
      if (response.status === 429) {
        console.error('Rate limit error:', data.message);
        throw new Error('Demasiadas solicitudes. Por favor, espera un momento.');
      }
      console.error('Email API error:', data);
      throw new Error(data.message || 'Error al enviar el email');
    }

    return data;
  } catch (error) {
    console.error('Error in sendEmail:', error);
    // If it's an authentication error, force a re-authentication
    if (error.message.includes('autenticación') || error.message.includes('sesión')) {
      await auth.signOut();
    }
    throw error;
  }
}; 