import { doc, getDoc } from "firebase/firestore";

import { db } from "../../config/firebase";

export const fetchSchedule = async () => {
  try {
    console.log('Debug - Fetching schedule...');
    const docRef = doc(db, "configuration", "schedule");
    console.log('Debug - Document reference:', docRef);
    
    const docSnap = await getDoc(docRef);
    console.log('Debug - Document snapshot exists:', docSnap.exists());
    
    if (docSnap.exists()) {
      const scheduleData = docSnap.data();
      console.log('Debug - Fetched Schedule Data:', scheduleData);
      return scheduleData;
    } else {
      console.log("Debug - Schedule document not found");
      // Return a default schedule as fallback
      return {
        monday: { start: "09:00", end: "17:00" },
        tuesday: { start: "09:00", end: "17:00" },
        wednesday: { start: "09:00", end: "17:00" },
        thursday: { start: "09:00", end: "17:00" },
        friday: { start: "09:00", end: "17:00" },
        saturday: { start: "09:00", end: "14:00" }
      };
    }
  } catch (error) {
    console.error('Debug - Error fetching schedule:', error);
    // Return a default schedule as fallback
    return {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: { start: "09:00", end: "17:00" },
      saturday: { start: "09:00", end: "14:00" }
    };
  }
};
