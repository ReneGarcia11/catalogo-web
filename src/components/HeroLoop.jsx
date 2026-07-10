import { useEffect, useState } from "react";
import { supabase } from "../data/Client";

const SLIDES_BASE = [
  {
    id: "cajita-chica",
    icon: "🌸",
    titulo: "Cajita chica",
    texto: "Elige 5 perfumes, uno por gama",
    destino: "kits",
  },
  {
    id: "cajita-grande",
    icon: "✦",
    titulo: "Cajita grande",
    texto: "La experiencia completa: hasta 10 perfumes",
    destino: "kits",
  },
  {
    id: "caja-emprendedora",
    icon: "💼",
    titulo: "Caja emprendedora",
    texto: "20 minis para regalo o para emprender",
    destino: "emprendedor",
  },
];

const HeroLoop = ({ onNavigate }) => {
  const [destacados, setDestacados] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchDestacados = async () => {
      const { data, error } = await supabase
        .from("perfumes")
        .select("*")
        .gt("stock", 0)
        .limit(6);

      if (!error && data) {
        setDestacados(data);
      }
    };
    fetchDestacados();
  }, []);

  const slideMinis = {
    id: "minis-destacados",
    icon: "🔥",
    titulo: "Minis destacados",
    texto:
      destacados.length > 0
        ? destacados
            .slice(0, 3)
            .map((p) => p.nombre || p.n)
            .filter(Boolean)
            .join(" · ")
        : "Lo más pedido de la temporada",
    destino: "piezas",
  };

  const slides = [SLIDES_BASE[0], SLIDES_BASE[1], slideMinis, SLIDES_BASE[2]];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="hero-loop">
      <div className="hero-loop-track">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            className={`hero-loop-slide ${i === activeIndex ? "is-active" : ""}`}
            onClick={() => onNavigate && onNavigate(slide.destino)}
          >
            <span className="hero-loop-icon">{slide.icon}</span>
            <span className="hero-loop-title">{slide.titulo}</span>
            <span className="hero-loop-text">{slide.texto}</span>
          </button>
        ))}
      </div>

      <div className="hero-loop-dots">
        {slides.map((slide, i) => (
          <span
            key={slide.id}
            className={`hero-loop-dot ${i === activeIndex ? "is-active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroLoop;
