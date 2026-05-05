import React, { useState, useEffect } from 'react';
import Kitcard from './Kitcard';
import { supabase } from "../data/Client";
import { useCart } from "../context/useCart";


const Kits = ({ openCart }) => {
  const { addToCart } = useCart();
  const [selectedKit, setSelectedKit] = useState(null);
  const [step, setStep] = useState(1);
  const [allPerfumes, setAllPerfumes] = useState([]);
  const [selectedPerfumes, setSelectedPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);


  const [filtroActivo, setFiltroActivo] = useState("Todas");
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
        console.error("Error cargando perfumes:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, []);

  const gamas = [...new Set(allPerfumes.map(p => p.gama).filter(Boolean))];

  const getImageUrl = (perfume) => {
    return perfume.img_storage_url || perfume.img || null;
  };

  const getMaxPerGama = () => {
    if (selectedKit === 5) return 1;
    if (selectedKit === 10) return 2;
    return 0;
  };

  const countPerGama = (gama) => {
    return selectedPerfumes.filter(p => p.gama === gama).length;
  };

  const canSelectPerfume = (perfume) => {
    if (selectedPerfumes.length >= selectedKit) return false;
    const countInGama = countPerGama(perfume.gama);
    const maxPerGama = getMaxPerGama();
    if (countInGama >= maxPerGama) return false;
    if (selectedPerfumes.find(p => p.id === perfume.id)) return false;
    return true;
  };

  const togglePerfume = (perfume) => {
    const isSelected = selectedPerfumes.find(p => p.id === perfume.id);
    if (isSelected) {
      setSelectedPerfumes(prev => prev.filter(p => p.id !== perfume.id));
    } else {
      if (canSelectPerfume(perfume)) {
        setSelectedPerfumes(prev => [...prev, perfume]);
      }
    }
  };

  const handleAddKitToCart = () => {
    if (selectedPerfumes.length !== selectedKit) {
      alert(`Debes seleccionar exactamente ${selectedKit} perfumes`);
      return;
    }

    const precioTotal = selectedKit === 5 ? 1650 : 2990;
    
    const kitItem = {
      id: `kit-${Date.now()}`,
      tipo: 'kit',
      nombre: `Kit de ${selectedKit} perfumes`,
      precio: precioTotal,
      cantidad: 1,
      perfumes: selectedPerfumes,
      fromKit: true
    };

    addToCart(kitItem);
    
    if (openCart) {
      openCart();
    }

    setSelectedKit(null);
    setSelectedPerfumes([]);
    setStep(1);
  };

  const handleSelectKit = (cantidad) => {
    setSelectedKit(cantidad);
    setSelectedPerfumes([]);
    setFiltroActivo("Todas");
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedPerfumes([]);
    setSelectedKit(null);
  };

  // Filtrar perfumes para el paso 2
  const perfumesFiltrados = allPerfumes.filter((p) => {
    if (filtroActivo === "Todas") return true;
    return p.genero?.toLowerCase() === filtroActivo.toLowerCase();
  });

  // Paso 1: Elegir kit
  const renderStep1 = () => (
    <>
      <div className="kits-header">
        <p>PASO 1 DE 2</p>
        <h2>Elige tu <span>caja</span></h2>
        <p>Selecciona el tamaño y después elige tus perfumes</p>
      </div>

      <div className="kits-grid">
        <Kitcard
          cantidad={5}
          descripcion="La caja perfecta para regalar. Elige 5 perfumes, uno por gama."
          reglas={[
            "5 perfumes a elegir",
            "Máximo 1 por gama"
          ]}
          precio="1,650"
          precioUnidad="330"
          selected={selectedKit === 5}
          onSelect={() => handleSelectKit(5)}
        />

        <Kitcard
          cantidad={10}
          descripcion="La experiencia completa. Hasta 2 perfumes por gama."
          reglas={[
            "10 perfumes a elegir",
            "Máximo 2 por gama"
          ]}
          precio="2,990"
          precioUnidad="299"
          selected={selectedKit === 10}
          onSelect={() => handleSelectKit(10)}
        />
      </div>
    </>
  );

  // Paso 2: Elegir perfumes (mismo diseño que Perfumes.jsx)
  const renderStep2 = () => (
    <>
      {/* Header del paso 2 */}
      <div className="kits-header">
        <p>PASO 2 DE 2</p>
        <h2>Elige tus <span>{selectedKit} perfumes</span></h2>
        <p>
          {selectedPerfumes.length} de {selectedKit} seleccionados · Máx {getMaxPerGama()} por gama
        </p>
        <button onClick={handleBack} className="back-btn">
          ← Cambiar caja
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="kit-progress-bar">
        <div 
          className="kit-progress-fill" 
          style={{ width: `${(selectedPerfumes.length / selectedKit) * 100}%` }}
        />
      </div>

      {/* Filter bar - IGUAL que Perfumes.jsx */}
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
          <p className="empty-t">Cargando perfumes...</p>
        </div>
      )}

      {!loading && (
        <>
          {gamas.map((gamaNombre) => {
            const perfumesDeEstaGama = perfumesFiltrados.filter(p => p.gama === gamaNombre);
            if (perfumesDeEstaGama.length === 0) return null;

            const countInGama = countPerGama(gamaNombre);
            const maxPerGama = getMaxPerGama();

            return (
              <div key={gamaNombre} className="gama-sec" data-gama={gamaNombre}>
                {/* Gama header - IGUAL que Perfumes.jsx */}
                <div className="gama-hd">
                  <div className="gama-line"></div>
                  <span className="gama-name">
                    {gamaNombre === "Top Picks" && "🔥 "}
                    {gamaNombre === "Exclusivos" && "✨ "}
                    {gamaNombre}
                  </span>
                  <span className="gama-badge">
                    {countInGama}/{maxPerGama}
                  </span>
                  <span className="gama-ct">{perfumesDeEstaGama.length} perfumes</span>
                </div>

                {/* Card grid - IGUAL que Perfumes.jsx */}
                <div className="card-grid">
                  {perfumesDeEstaGama.map((p) => {
                    const imageUrl = getImageUrl(p);
                    const isSelected = selectedPerfumes.some(sp => sp.id === p.id);
                    const canSelect = canSelectPerfume(p);
                    const isDisabled = !canSelect && !isSelected;
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`pc ${isDisabled ? 'pc-blk' : ''} ${isSelected ? 'pc-selected' : ''}`}
                        onClick={() => !isDisabled && togglePerfume(p)}
                      >
                        {/* Image wrapper - IGUAL que Perfumes.jsx */}
                        <div className={`pc-img-w g-${p.genero?.toLowerCase() || 'unisex'}`}>
                          <img 
                            src={imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' fill='%23F2EDE5'%3E%3Crect width='200' height='250'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='48' fill='%23B89A5E' opacity='0.3'%3E🕯️%3C/text%3E%3C/svg%3E"}
                            alt={p.nombre} 
                            className="pc-img"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = '#F2EDE5';
                            }}
                          />
                          
                          {/* Overlay para seleccionados */}
                          {isSelected && (
                            <div className="pc-ov" style={{ background: 'rgba(184, 154, 94, 0.25)' }}>
                              <span className="pc-ov-txt" style={{ 
                                background: 'var(--gold)', 
                                padding: '4px 12px',
                                borderRadius: '100px',
                                fontSize: '0.5rem',
                                letterSpacing: '2px'
                              }}>
                                ✓ SELECCIONADO
                              </span>
                            </div>
                          )}

                          {/* Overlay para disabled */}
                          {isDisabled && (
                            <div className="pc-ov">
                              <span className="pc-ov-txt">COMPLETO</span>
                            </div>
                          )}

                          {/* Gender tag - IGUAL */}
                          <div className="gender-tag">
                            <span className="gender-tag-text">{p.genero}</span>
                          </div>
                        </div>

                        {/* Card body - IGUAL que Perfumes.jsx */}
                        <div className="pc-body">
                          <div className="pc-bar" style={{ background: isSelected ? 'var(--gold)' : 'var(--gold)' }}></div>
                          <p className="pc-brand">{p.marca}</p>
                          <h4 className="pc-name">{p.nombre}</h4>
                          <p className="pc-gama">{p.gama}</p>
                          <p className="pc-price">${p.precio?.toLocaleString()}</p>
                          
                          {/* Botón de selección */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isDisabled) togglePerfume(p);
                            }}
                            className="add-btn"
                            style={{
                              marginTop: '8px',
                              background: isSelected ? 'var(--gold)' : 'var(--black)',
                              color: isSelected ? 'var(--black)' : 'var(--gold)'
                            }}
                            disabled={isDisabled}
                          >
                            {isSelected ? '✓ SELECCIONADO' : isDisabled ? 'COMPLETO' : '+ AGREGAR'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Botón confirmar flotante */}
          {selectedPerfumes.length > 0 && (
            <div className="kit-confirm-floating">
              <button
                onClick={handleAddKitToCart}
                disabled={selectedPerfumes.length !== selectedKit}
                className="kit-confirm-btn"
              >
                {selectedPerfumes.length === selectedKit
                  ? `✓ Agregar kit · $${selectedKit === 5 ? '1,650' : '2,990'} MXN`
                  : `Selecciona ${selectedKit - selectedPerfumes.length} más`
                }
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <section className="kits">
      {step === 1 ? renderStep1() : renderStep2()}
    </section>
  );
};

export default Kits;