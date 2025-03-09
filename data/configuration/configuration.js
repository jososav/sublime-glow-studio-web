import { doc, getDoc } from "firebase/firestore";

import { db } from "../../config/firebase";

export const fetchSchedule = async () => {
  const docRef = doc(db, "configuration", "schedule");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("Schedule was not found.");
    return null;
  }
};
