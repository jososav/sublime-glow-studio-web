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

// Generate a device ID
const generateDeviceId = () => {
  return 'device_' + Math.random().toString(36).substr(2, 9);
};

// Get or create device ID
const getDeviceId = () => {
  if (typeof window === 'undefined') return null;
  
  let deviceId = localStorage.getItem('mp_device_id');
  if (!deviceId) {
    deviceId = generateDeviceId();
    localStorage.setItem('mp_device_id', deviceId);
  }
  return deviceId;
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
      const deviceId = getDeviceId();
      console.log('Setting device ID:', deviceId);
      mixpanel.identify(deviceId);
    }
    
    // Add device ID to all events
    const deviceId = getDeviceId();
    const enhancedProperties = {
      ...properties,
      device_id: deviceId
    };
    
    console.log('Tracking event:', eventName, 'with distinct_id:', mixpanel.get_distinct_id());
    mixpanel.track(eventName, enhancedProperties);
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
      
      // Only alias if we're transitioning from device ID to identified
      if (currentId && currentId.startsWith('device_')) {
        console.log('Aliasing device user to:', user.uid);
        mixpanel.alias(user.uid);
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
        user_id: user.uid,
        device_id: getDeviceId() // Include device ID in user properties
      });
    } else {
      // Reset to device ID for logged out users
      const deviceId = getDeviceId();
      console.log('Resetting to device ID:', deviceId);
      mixpanel.reset();
      mixpanel.identify(deviceId);
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

// Track revenue using Mixpanel's built-in revenue tracking
export const trackRevenue = async (amount, properties = {}, customerUserId = null) => {
  try {
    // Wait for Mixpanel to be ready
    await waitForMixpanel();
    
    // If customerUserId is provided, temporarily identify as the customer for revenue tracking
    let originalDistinctId = null;
    if (customerUserId) {
      originalDistinctId = mixpanel.get_distinct_id();
      console.log('Temporarily identifying as customer for revenue tracking:', customerUserId);
      mixpanel.identify(customerUserId);
    } else {
      // Double check we have a distinct_id
      const distinctId = mixpanel.get_distinct_id();
      if (!distinctId || distinctId === '') {
        const deviceId = getDeviceId();
        console.log('Setting device ID:', deviceId);
        mixpanel.identify(deviceId);
      }
    }
    
    // Add device ID to all events
    const deviceId = getDeviceId();
    const enhancedProperties = {
      ...properties,
      device_id: deviceId,
      timestamp: new Date().toISOString()
    };
    
    console.log('Tracking revenue:', amount, 'with distinct_id:', mixpanel.get_distinct_id());
    mixpanel.people.track_charge(amount, enhancedProperties);
    
    // Restore original distinct_id if we temporarily changed it
    if (customerUserId && originalDistinctId) {
      console.log('Restoring original distinct_id:', originalDistinctId);
      mixpanel.identify(originalDistinctId);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to track revenue:', error);
    return false;
  }
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