import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Atajo de teclado oculto para entrar al panel de administracion.
// Ctrl + Shift + A (en cualquier pagina del sitio) lleva a /Panel.
const AdminShortcut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        navigate("/Panel");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
};

export default AdminShortcut;
