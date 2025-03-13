import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const useServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const servicesRef = collection(db, "services");
        const querySnapshot = await getDocs(servicesRef);
        
        const servicesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return {
    services,
    loading,
    error
  };
}; 