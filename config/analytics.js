// Google Analytics 4 configuration
export const GA_TRACKING_ID = 'G-F5FWYBYZRT';

// Track page views
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Set user ID
export const setUserId = (userId) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: userId });
  }
};

// Set user properties
export const setUserProperties = (properties) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_properties: properties });
  }
}; 