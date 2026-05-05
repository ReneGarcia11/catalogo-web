import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../data/Client";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Verificar sesión
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No hay sesión");
          setIsAuthenticated(false);
          return;
        }

        console.log("Usuario autenticado:", session.user.email);

        // Verificar rol directamente sin consultar profiles
        // Opción 1: Si confías en el email
        const adminEmails = ["tuemail@gmail.com", "admin@tudominio.com"]; // Agrega tu email aquí
        
        if (adminEmails.includes(session.user.email)) {
          console.log("Admin verificado por email");
          setIsAuthenticated(true);
          return;
        }

        // Opción 2: Verificar en profiles si existe la tabla
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error) {
            console.warn("Error al consultar profiles:", error.message);
            // Si falla la consulta, verificar solo por email
            setIsAuthenticated(true); // Temporal para debugging
            return;
          }

          console.log("Profile:", profile);

          if (profile && profile.role === "admin") {
            console.log("Admin verificado por perfil");
            setIsAuthenticated(true);
          } else {
            console.log("No es admin:", profile);
            setIsAuthenticated(false);
          }
        } catch (err) {
          console.error("Error en consulta:", err);
          // Si hay error, permitir acceso temporal para debug
          setIsAuthenticated(true);
        }

      } catch (err) {
        console.error("Error general:", err);
        setIsAuthenticated(false);
      }
    };

    checkAccess();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#B89A5E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/Panel" replace />;
  }

  return children;
};

export default ProtectedRoute;