import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    console.log("Starting fetchUsers...");
    try {
      setLoading(true);
      setError(null);
      
      console.log("Getting users collection...");
      const usersCollection = collection(db, "users");
      console.log("Users collection reference:", usersCollection);
      
      console.log("Fetching users snapshot...");
      const usersSnapshot = await getDocs(usersCollection);
      console.log("Users snapshot received:", usersSnapshot.size, "documents");
      
      if (usersSnapshot.empty) {
        console.log("Users collection is empty");
        setUsers([]);
      } else {
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Processed users data:", usersData);
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setError(error.message);
      setUsers([]);
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useUsers effect triggered");
    fetchUsers();
  }, []);

  console.log("useUsers hook state:", { loading, error, usersCount: users.length });

  return {
    users,
    loading,
    error,
    refreshUsers: fetchUsers
  };
}; 