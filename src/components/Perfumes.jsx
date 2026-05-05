import React, { useState, useEffect } from "react";
import { useCart } from "../context/useCart";
import { supabase } from "../data/Client";
import "./Perfumes.css";

const Perfumes = ({ openCart }) => {
  const { addToCart } = useCart();

  const [allPerfumes, setAllPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtroActivo, setFiltroActivo] = useState("Todas");
  const [addedProductId, setAddedProductId] = useState(null); // Para animación de confirmación
  
  const gamas = ["Top Picks", "Exclusivos", "Selecta", "Favoritos", "Basicos"];
  
  const botonesFiltro = [
    { label: "Todas", valor: "Todas" },
    { label: "🌸 Mujer", valor: "Mujer" },
    { label: "🔵 Hombre", valor: "Hombre" },
    { label: "✦ Unisex", valor: "Mixto" }
  ];

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("perfumes").select("*");
        if (error) throw error;
        setAllPerfumes(data || []);
      } catch (err) {
        console.error("Error:", err.message);
        setError("Error al cargar catálogo");
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, []);

  // Obtener la mejor URL de imagen disponible (prioriza storage)
  const getImageUrl = (perfume) => {
    return perfume.img_storage_url || perfume.img || null;
  };

  const perfumesFiltrados = allPerfumes.filter((p) => {
    if (filtroActivo === "Todas") return true;
    return p.genero?.toLowerCase() === filtroActivo.toLowerCase();
  });

  // Función para agregar al carrito sin abrirlo
  const handleAddToCart = (p) => {
    if (p.stock > 0) {
      addToCart(p);
      
      // Mostrar confirmación visual
      setAddedProductId(p.id);
      setTimeout(() => {
        setAddedProductId(null);
      }, 1500);
    }
  };

  return (
    <>
      {/* Filter bar */}
      <div className="fbar">
        {botonesFiltro.map((btn) => (
          <button
            key={btn.valor}
            onClick={() => setFiltroActivo(btn.valor)}
            className={`fc ${filtroActivo === btn.valor ? 'on' : ''}`}
            aria-pressed={filtroActivo === btn.valor}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="empty">
          <div className="ld-b" style={{ margin: '0 auto 16px' }}></div>
          <p className="empty-t">Buscando las mejores fragancias...</p>
        </div>
      )}

      {error && (
        <div className="empty">
          <span className="empty-i">⚠️</span>
          <p className="empty-t">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {gamas.map((gamaNombre) => {
            const perfumesDeEstaGama = perfumesFiltrados.filter(p => p.gama === gamaNombre);
            if (perfumesDeEstaGama.length === 0) return null;

            return (
              <div key={gamaNombre} className="gama-sec" data-gama={gamaNombre}>
                {/* Gama header */}
                <div className="gama-hd">
                  <div className="gama-line"></div>
                  <span className="gama-name">
                    {gamaNombre === "Top Picks" && "🔥 "}
                    {gamaNombre === "Exclusivos" && "✨ "}
                    {gamaNombre}
                  </span>
                  <span className="gama-badge">{perfumesDeEstaGama.length}</span>
                  <span className="gama-ct">{perfumesDeEstaGama.length} perfumes</span>
                </div>

                {/* Card grid */}
                <div className="card-grid">
                  {perfumesDeEstaGama.map((p) => {
                    const imageUrl = getImageUrl(p);
                    const isJustAdded = addedProductId === p.id;
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`pc ${p.stock <= 0 ? 'pc-blk' : ''}`}
                      >
                        {/* Image wrapper */}
                        <div className={`pc-img-w g-${p.genero?.toLowerCase() || 'unisex'}`}>
                          <img 
                            src={imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' fill='%23F2EDE5'%3E%3Crect width='200' height='250'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='48' fill='%23B89A5E' opacity='0.3'%3E🕯️%3C/text%3E%3C/svg%3E"}
                            alt={p.nombre} 
                            className="pc-img"
                            loading="lazy"
                            onError={(e) => {
                              // Si falla la imagen, mostrar placeholder
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = '#F2EDE5';
                            }}
                          />
                          
                          {/* Overlay for out of stock */}
                          {p.stock <= 0 && (
                            <div className="pc-ov">
                              <span className="pc-ov-txt">Agotado</span>
                            </div>
                          )}

                          {/* Gender tag */}
                          <div className="gender-tag">
                            <span className="gender-tag-text">{p.genero}</span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="pc-body">
                          <div className="pc-bar" style={{ background: 'var(--gold)' }}></div>
                          <p className="pc-brand">{p.marca}</p>
                          <h4 className="pc-name">{p.nombre}</h4>
                          <p className="pc-gama">{p.gama}</p>
                          <p className="pc-price">${p.precio?.toLocaleString()}</p>
                          
                          {/* Add to cart button */}
                          <button
                            onClick={() => handleAddToCart(p)}
                            className={`add-btn ${isJustAdded ? 'added' : ''}`}
                            style={{ marginTop: '8px' }}
                            disabled={p.stock <= 0}
                          >
                            {isJustAdded ? '✓ AGREGADO' : '+ AGREGAR'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {!loading && !error && perfumesFiltrados.length === 0 && (
        <div className="empty">
          <span className="empty-i">🔍</span>
          <p className="empty-t">No encontramos perfumes en esta categoría.</p>
          <button 
            onClick={() => setFiltroActivo("Todas")}
            className="fc on"
            style={{ marginTop: '16px' }}
          >
            Ver todas las fragancias
          </button>
        </div>
      )}

      {/* Choose prompt */}
      <div className="choose-p" hidden={perfumesFiltrados.length > 0}>
        <span className="cp-arr">↓</span>
        <p className="cp-txt">Elige una fragancia para comenzar</p>
      </div>
    </>
  );
};

export default Perfumes;