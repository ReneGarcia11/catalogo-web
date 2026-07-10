import { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Heroo";
import Benefits from "./components/Benefits";
import Menu from "./components/Menu";
import Kits from "./components/Kits";
import Perfumes from "./components/Perfumes";
import Emprendedor from "./components/Emprendedor";
import Footer from "./components/Footer";
import Cart from "./components/Cart";

const AdminLogin = lazy(() => import("./accesadmin/AdminLogin"));
const AdminPerfumes = lazy(() => import("./admin/AdminPerfumes"));
const Base64Decoder = lazy(() => import("./components/Base64Decoder"));
const ProtectedRoute = lazy(() => import("./accesadmin/ProtectedRoute"));

function HomePage() {
  const [active, setActive] = useState("kits");
  const [openCart, setOpenCart] = useState(false);

  return (
    <>
      <Header onOpenCart={() => setOpenCart(true)} />
      <Hero />
      <Benefits />
      <Menu active={active} setActive={setActive} />

      {active === "kits" && <Kits />}
      {active === "piezas" && (
        <Perfumes openCart={() => setOpenCart(true)} />
      )}

      {/* 🔥 FIX AQUÍ */}
      {active === "emprendedor" && (
        <Emprendedor openCart={() => setOpenCart(true)} />
      )}

      <Footer />
      <Cart open={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center">
      <div className="text-center">
        <span className="text-5xl mb-6 block">🕯️</span>
        <h1 className="font-serif text-3xl text-[#18140F] mb-3">
          Página no encontrada
        </h1>
        <p className="text-[#6B6055] text-sm mb-8">
          La página que buscas no existe o ha sido movida
        </p>
        <a
          href="/"
          className="inline-block px-8 py-3 bg-[#18140F] text-[#B89A5E] text-xs uppercase tracking-[2px] font-semibold rounded-sm hover:bg-black transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen bg-[#F7F2EC] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-2 border-[#B89A5E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#9B8E82] text-xs uppercase tracking-[3px] animate-pulse">
              Cargando
            </p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/Panel" element={<AdminLogin />} />

          <Route
            path="/Panel/admin"
            element={
              <ProtectedRoute>
                <AdminPerfumes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/decode"
            element={
              <ProtectedRoute>
                <Base64Decoder />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;