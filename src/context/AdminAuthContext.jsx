import React, { createContext, useContext, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

// Correo único autorizado para el Panel de Administrador
export const AUTHORIZED_ADMIN_EMAIL = "wuisem051@gmail.com";

const AdminAuthContext = createContext({});
export const useAdminAuth = () => useContext(AdminAuthContext);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loginAdmin = async (email, password) => {
    // 1. Candado estricto por correo único
    if (email.trim().toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Acceso denegado: Este correo no tiene autorización de Administrador.");
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    
    // 2. Candado en base de datos Firestore (debe ser admin)
    if (!snap.exists() || snap.data().role !== "admin") {
      await signOut(auth);
      throw new Error("Acceso denegado: Tu perfil no cuenta con privilegios de administrador.");
    }
    return cred.user;
  };

  const logoutAdmin = () => signOut(auth);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists() && snap.data().role === "admin") {
            setAdminUser({ uid: user.uid, email: user.email, profile: snap.data() });
            setIsAdmin(true);
          } else {
            setAdminUser(null);
            setIsAdmin(false);
          }
        } catch {
          setAdminUser(null);
          setIsAdmin(false);
        }
      } else {
        setAdminUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAdmin, loading, loginAdmin, logoutAdmin }}>
      {!loading && children}
    </AdminAuthContext.Provider>
  );
}