import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthentication } from "../providers/Authentication/authentication";

export const AdminProtected = ({ children }) => {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuthentication();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/404");
    }
  }, [isAdmin, authLoading, router]);

  if (authLoading) {
    return <div className="loading">Cargando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return children;
}; 