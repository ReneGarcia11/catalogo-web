import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../data/Client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        // Traducir errores comunes
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error("Correo o contraseña incorrectos");
        }
        if (authError.message.includes("Email not confirmed")) {
          throw new Error("El correo no ha sido confirmado");
        }
        throw authError;
      }

      // 2. Verificar que el usuario es admin (tiene el rol adecuado)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profileData) {
        // Si no hay perfil, cerrar sesión
        await supabase.auth.signOut();
        throw new Error("No tienes permisos de administrador");
      }

      if (profileData.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("No tienes permisos de administrador");
      }

      // 3. Login exitoso - guardar sesión
      localStorage.setItem("adminAuth", "true");
      localStorage.setItem("adminLoginTime", Date.now());
      localStorage.setItem("adminEmail", email);
      
      navigate("/Panel/admin", { replace: true });

    } catch (err) {
      console.error("Error de login:", err);
      setError(err.message || "Error al iniciar sesión");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Título */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#18140F] mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="font-serif text-2xl text-[#18140F] mb-2">
            Panel de Administración
          </h1>
          <p className="text-xs text-[#9B8E82] uppercase tracking-[2px]">
            Acceso Restringido
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-[#FFFDF9] border border-[#E8DECE] rounded-sm p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-2 font-medium">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="admin@ejemplo.com"
                className="w-full px-4 py-3 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors placeholder:text-[#9B8E82]"
                autoFocus
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[10px] uppercase tracking-[2px] text-[#6B6055] mb-2 font-medium">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[#E8DECE] bg-[#FAF7F3] text-[#18140F] text-sm rounded-sm focus:border-[#B89A5E] focus:outline-none transition-colors placeholder:text-[#9B8E82]"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                <p className="text-red-600 text-[10px] uppercase tracking-[1px] flex items-center gap-1.5">
                  <span>⚠️</span> {error}
                </p>
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-[#18140F] text-[#B89A5E] text-xs uppercase tracking-[2px] font-semibold rounded-sm hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#B89A5E] border-t-transparent rounded-full animate-spin"></span>
                  Verificando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8DECE]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FFFDF9] px-3 text-[9px] text-[#9B8E82] uppercase tracking-[1px]">
                Admin
              </span>
            </div>
          </div>

          {/* Info */}
          <p className="text-[10px] text-[#9B8E82] text-center leading-relaxed">
            Solo usuarios autorizados con rol de administrador pueden acceder.
          </p>
        </div>

        {/* Volver */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-[10px] uppercase tracking-[2px] text-[#9B8E82] hover:text-[#B89A5E] transition-colors"
          >
            ← Volver al catálogo
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;