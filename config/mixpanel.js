import mixpanel from 'mixpanel-browser';

let isInitialized = false;
let initializationPromise = null;

// Only initialize on client side
const initMixpanel = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  if (!initializationPromise) {
    initializationPromise = new Promise((resolve) => {
      // Initialize Mixpanel
      mixpanel.init('805e8ee35eb4af8d5f662c683cfc18f0', {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: false, // We'll handle this manually
        persistence: 'localStorage',
        ignore_dnt: true, // You might want to respect Do Not Track in production
        loaded: () => {
          console.log('Mixpanel loaded callback triggered');
          // Set initial anonymous ID if needed
          const distinctId = mixpanel.get_distinct_id();
          if (!distinctId || distinctId === '') {
            const anonymousId = getAnonymousId();
            console.log('Setting initial anonymous ID:', anonymousId);
            mixpanel.identify(anonymousId);
          }
          isInitialized = true;
          resolve();
        }
      });
    });
  }

  return initializationPromise;
};

// Initialize Mixpanel immediately
if (typeof window !== 'undefined') {
  initMixpanel().then(() => {
    console.log('Mixpanel initialization complete');
  }).catch(error => {
    console.error('Error initializing Mixpanel:', error);
  });
}

// Generate a unique anonymous ID
const generateAnonymousId = () => {
  return 'anon_' + Math.random().toString(36).substr(2, 9);
};

// Get or create anonymous ID
const getAnonymousId = () => {
  if (typeof window === 'undefined') return null;
  
  let anonymousId = localStorage.getItem('mp_anonymous_id');
  if (!anonymousId) {
    anonymousId = generateAnonymousId();
    localStorage.setItem('mp_anonymous_id', anonymousId);
  }
  return anonymousId;
};

// Check if Mixpanel is ready
const isMixpanelReady = () => {
  return isInitialized && 
         typeof window !== 'undefined' && 
         window.mixpanel && 
         window.mixpanel.__loaded;
};

// Wait for Mixpanel to be ready with timeout
const waitForMixpanel = (timeout = 10000) => {
  if (isMixpanelReady()) {
    return Promise.resolve();
  }

  return initializationPromise || Promise.reject(new Error('Mixpanel not initialized'));
};

// Safe tracking wrapper with timeout
const safeTrack = async (eventName, properties = {}) => {
  try {
    // Wait for Mixpanel to be ready
    await waitForMixpanel();
    
    // Double check we have a distinct_id
    const distinctId = mixpanel.get_distinct_id();
    if (!distinctId || distinctId === '') {
      const anonymousId = getAnonymousId();
      console.log('Re-setting anonymous ID:', anonymousId);
      mixpanel.identify(anonymousId);
    }
    
    console.log('Tracking event:', eventName, 'with distinct_id:', mixpanel.get_distinct_id());
    mixpanel.track(eventName, properties);
    return true;
  } catch (error) {
    console.error('Failed to track event:', eventName, error);
    return false;
  }
};

// Track page views with retry
export const trackPageView = async (pathname) => {
  const properties = {
    page: pathname,
    url: window?.location?.href,
    referrer: document?.referrer,
    timestamp: new Date().toISOString()
  };
  
  console.log('Attempting to track page view:', pathname);
  return safeTrack('Page View', properties);
};

// Set user identity
export const identifyUser = async (user) => {
  if (typeof window === 'undefined') return;

  try {
    // Wait for Mixpanel to be ready
    await waitForMixpanel();

    if (user?.uid) {
      const currentId = mixpanel.get_distinct_id();
      console.log('Current distinct_id:', currentId);
      
      // Only alias if we're transitioning from anonymous to identified
      if (currentId && currentId.startsWith('anon_')) {
        console.log('Aliasing anonymous user to:', user.uid);
        // First alias the anonymous ID to the user ID
        mixpanel.alias(user.uid);
        // Then clear the anonymous ID
        localStorage.removeItem('mp_anonymous_id');
      }
      
      // Now identify the user
      console.log('Identifying user:', user.uid);
      mixpanel.identify(user.uid);
      
      // Set user properties
      mixpanel.people.set({
        $email: user.email,
        $name: user.displayName,
        $created: user.metadata.creationTime,
        last_login: user.metadata.lastSignInTime,
        provider: user.providerData[0]?.providerId || 'unknown',
        user_id: user.uid
      });
    } else {
      // Reset identity for logged out users
      const anonymousId = getAnonymousId();
      console.log('Resetting to anonymous user:', anonymousId);
      localStorage.setItem('mp_anonymous_id', anonymousId);
      mixpanel.reset();
      mixpanel.identify(anonymousId);
    }
  } catch (error) {
    console.error('Error identifying user:', error);
  }
};

// Track events with properties
export const track = async (eventName, properties = {}) => {
  return safeTrack(eventName, {
    ...properties,
    timestamp: new Date().toISOString()
  });
};

// Track error events
export const trackError = (error, context = {}) => {
  safeTrack('Error', {
    error_message: error.message,
    error_code: error.code,
    error_stack: error.stack,
    ...context,
    timestamp: new Date().toISOString()
  });
};

// Alias for tracking specific events
export const events = {
  // Authentication events
  LOGIN: 'User Login',
  SIGNUP: 'User Signup',
  LOGOUT: 'User Logout',
  
  // Profile events
  PROFILE_UPDATE: 'Profile Updated',
  
  // Appointment events
  APPOINTMENT_CREATED: 'Appointment Created',
  APPOINTMENT_CANCELLED: 'Appointment Cancelled',
  
  // Service events
  SERVICE_VIEWED: 'Service Viewed',
  
  // Referral events
  REFERRAL_CREATED: 'Referral Created',
  REFERRAL_CONVERTED: 'Referral Converted',
  
  // Coupon events
  COUPON_APPLIED: 'Coupon Applied',
  COUPON_CREATED: 'Coupon Created'
}; 