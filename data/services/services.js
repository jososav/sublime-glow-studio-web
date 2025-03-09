import { getDocs, collection } from "firebase/firestore";

import { db } from "../../config/firebase";

export const fetchServices = async () => {
  const services = [];

  const querySnapshot = await getDocs(collection(db, "services"));

  querySnapshot.forEach((doc) => {
    services.push({ id: doc.id, ...doc.data() });
  });

  return services;
};
