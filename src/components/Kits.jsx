import React, { useState, useEffect } from 'react';
import Kitcard from './Kitcard';
import { supabase } from "../data/Client";
import { useCart } from "../context/useCart";

// Orden fijo de gamas
const GAMAS_ORDER = ["Top Picks", "Exclusivos", "Selecta", "Favoritos", "Básicos"];

const Kits = ({ openCart }) => {
  const { addToCart } = useCart();
  const [selectedKit, setSelectedKit] = useState(null);
  const [step, setStep] = useState(1);
  const [allPerfumes, setAllPerfumes] = useState([]);
  const [selectedPerfumes, setSelectedPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [filtroActivo, setFiltroActivo] = useState("Todas");
  const botonesFiltro = [
    { label: "Todas", valor: "Todas" },
    { label: "🌸 Mujer", valor: "Mujer" },
    { label: "🔵 Hombre", valor: "Hombre" }
  ];

  useEffect(() => {
    const fetchPerfumes = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        
        const { data, error } = await supabase.from("perfumes").select("*");
        
        if (error) {
          console.error("Error Supabase:", error.message);
          setErrorMsg(`Error: ${error.message}`);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn("No se encontraron perfumes en la base de datos");
          setErrorMsg('No hay perfumes disponibles');
          setAllPerfumes([]);
          return;
        }
        
        console.log("Perfumes cargados:", data.length, "Primer perfume:", data[0]);
        
        // Ordenar por ID de menor a mayor
        const sorted = data.sort((a, b) => {
          const idA = String(a.id || '');
          const idB = String(b.id || '');
          return idA.localeCompare(idB, undefined, { numeric: true });
        });
        
        setAllPerfumes(sorted);
      } catch (err) {
        console.error("Error cargando perfumes:", err.message);
        setErrorMsg(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, []);

  const gamas = GAMAS_ORDER.filter(gama =>
    allPerfumes.some(p => p.gama === gama)
  );

  const getImageUrl = (perfume) => {
    return perfume.img_storage_url || perfume.img || perfume.image_url || null;
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

    setAddingToCart(true);

    const precioTotal = selectedKit === 5 ? 1650 : 2990;
    const kitTimestamp = Date.now();
    
    // Agregar cada perfume individualmente al carrito
    selectedPerfumes.forEach((perfume, index) => {
      const perfumeItem = {
        id: `kit-${kitTimestamp}-${index}`,
        tipo: 'kit',
        nombre: perfume.nombre || perfume.n || '',
        marca: perfume.marca || perfume.m || '',
        precio: 0,
        cantidad: 1,
        fromKit: true,
        kitId: `kit-${kitTimestamp}`,
        genero: perfume.genero || perfume.g || '',
        gama: perfume.gama || perfume.gm || ''
      };
      addToCart(perfumeItem);
    });

    // Agregar el kit como item principal
    const kitItem = {
      id: `kit-pkg-${kitTimestamp}`,
      tipo: 'kit',
      nombre: `Kit de ${selectedKit} perfumes`,
      marca: 'Vale Minis',
      precio: precioTotal,
      cantidad: 1,
      perfumes: selectedPerfumes,
      fromKit: true,
      isKitPackage: true
    };

    addToCart(kitItem);
    
    setTimeout(() => {
      setAddingToCart(false);
      if (openCart) {
        openCart();
      }
      setSelectedKit(null);
      setSelectedPerfumes([]);
      setStep(1);
    }, 300);
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

  const perfumesFiltrados = allPerfumes.filter((p) => {
    if (filtroActivo === "Todas") return true;
    return (p.genero || p.g || '')?.toLowerCase() === filtroActivo.toLowerCase();
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

  // Paso 2: Elegir perfumes
  const renderStep2 = () => (
    <>
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

      <div className="kit-progress-bar">
        <div 
          className="kit-progress-fill" 
          style={{ width: `${(selectedPerfumes.length / selectedKit) * 100}%` }}
        />
      </div>

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
          <p style={{ fontSize: '0.6875rem', color: 'var(--stone2)', marginTop: '8px' }}>
            Conectando con la base de datos...
          </p>
        </div>
      )}

      {!loading && errorMsg && (
        <div className="empty">
          <span className="empty-i" aria-hidden="true">⚠️</span>
          <p className="empty-t">{errorMsg}</p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--stone2)', marginTop: '8px' }}>
            Verifica la conexión con Supabase y que la tabla "perfumes" exista
          </p>
        </div>
      )}

      {!loading && !errorMsg && (
        <>
          {gamas.length === 0 && (
            <div className="empty">
              <span className="empty-i" aria-hidden="true">🌸</span>
              <p className="empty-t">No hay perfumes disponibles</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--stone2)', marginTop: '8px' }}>
                Los perfumes se cargaron pero no coinciden con las gamas: {GAMAS_ORDER.join(', ')}
              </p>
            </div>
          )}

          {gamas.map((gamaNombre) => {
            const perfumesDeEstaGama = perfumesFiltrados.filter(p => p.gama === gamaNombre);
            if (perfumesDeEstaGama.length === 0) return null;

            const countInGama = countPerGama(gamaNombre);
            const maxPerGama = getMaxPerGama();

            return (
              <div key={gamaNombre} className="gama-sec" data-gama={gamaNombre}>
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
                        <div className={`pc-img-w g-${(p.genero || p.g || 'Unisex').toLowerCase()}`}>
                          <img 
                            src={imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' fill='%23F2EDE5'%3E%3Crect width='200' height='250'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='48' fill='%23B89A5E' opacity='0.3'%3E🕯️%3C/text%3E%3C/svg%3E"}
                            alt={p.nombre || p.n} 
                            className="pc-img"
                            loading="lazy"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.style.background = '#F2EDE5';
                            }}
                          />
                          
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

                          {isDisabled && (
                            <div className="pc-ov">
                              <span className="pc-ov-txt">COMPLETO</span>
                            </div>
                          )}

                          <div className="gender-tag">
                            <span className="gender-tag-text">{p.genero || p.g}</span>
                          </div>
                        </div>

                        <div className="pc-body">
                          <div className="pc-bar" style={{ background: isSelected ? 'var(--gold)' : 'var(--gold)' }}></div>
                          <p className="pc-brand">{p.marca || p.m}</p>
                          <h4 className="pc-name">{p.nombre || p.n}</h4>
                          <p className="pc-gama">{p.gama || p.gm}</p>
                          <p className="pc-price">${p.precio?.toLocaleString()}</p>
                          
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

          {selectedPerfumes.length === selectedKit && (
            <div className="kit-confirm-floating">
              <div className="kit-confirm-info">
                <span className="kit-confirm-label">Kit de {selectedKit} perfumes</span>
                <span className="kit-confirm-price">
                  ${selectedKit === 5 ? '1,650' : '2,990'} MXN
                </span>
              </div>
              <button
                onClick={handleAddKitToCart}
                disabled={addingToCart}
                className="kit-confirm-btn"
                style={{
                  background: addingToCart ? 'var(--green)' : 'var(--gold)',
                  color: 'var(--black)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '0.6875rem',
                  letterSpacing: '3px',
                  fontWeight: '600',
                  transition: 'all 0.22s'
                }}
              >
                {addingToCart ? (
                  <>
                    <span style={{ 
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid var(--black)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite'
                    }} />
                    AGREGANDO...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    AGREGAR KIT
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <section className="kits">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .kit-confirm-floating {
          position: sticky;
          bottom: 0;
          background: var(--cream2);
          padding: 20px;
          border-top: 1px solid var(--border);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
        }
        
        .kit-confirm-info {
          flex: 1;
          min-width: 0;
        }
        
        .kit-confirm-label {
          display: block;
          font-family: var(--serif);
          font-size: 1rem;
          font-style: italic;
          color: var(--black);
        }
        
        .kit-confirm-price {
          display: block;
          font-family: var(--serif);
          font-size: 1.5rem;
          color: var(--gold);
          font-weight: 300;
        }
        
        .kit-confirm-btn {
          flex-shrink: 0;
          padding: 14px 28px;
          border: none;
          font-family: var(--sans);
          cursor: pointer;
          border-radius: 2px;
          white-space: nowrap;
        }
        
        .kit-confirm-btn:hover:not(:disabled) {
          background: var(--gold2) !important;
        }
        
        .kit-confirm-btn:disabled {
          opacity: 0.8;
          cursor: wait;
        }
        
        @media (max-width: 480px) {
          .kit-confirm-floating {
            flex-direction: column;
            text-align: center;
          }
          .kit-confirm-btn {
            width: 100%;
          }
        }
      `}</style>
      
      {step === 1 ? renderStep1() : renderStep2()}
    </section>
  );
};

export default Kits;