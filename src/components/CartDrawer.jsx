import React, { useState, useEffect, useRef } from 'react';
import './CartDrawer.css';

const CartDrawer = ({ 
  open, 
  onClose,
  cart = [],
  removeFromCart,
  clearCart,
  formData,
  onInputChange,
  onConfirm
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const drawerRef = useRef(null);
  const lastFocusedBtn = useRef(null);
  const nombreInputRef = useRef(null);

  
  useEffect(() => {
    if (open) {
      lastFocusedBtn.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0';
      
      
      setTimeout(() => {
        if (nombreInputRef.current) {
          nombreInputRef.current.focus();
        }
      }, 350);
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (lastFocusedBtn.current) {
        lastFocusedBtn.current.focus();
        lastFocusedBtn.current = null;
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);


  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (e.key !== 'Tab') return;

    const focusableElements = drawerRef.current?.querySelectorAll(
      'button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  
  const subtotal = cart.reduce((sum, item) => {
    const precio = item.precio || 0;
    const qty = item.cantidad || item.qty || 1;
    return sum + precio * qty;
  }, 0);

  const IVA = subtotal * 0.16;
  const totalPrecio = subtotal + IVA;

  
  const handleClearCart = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    setConfirmClear(false);
    if (clearCart) clearCart();
  };


  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!formData.nombre.trim()) {
      if (nombreInputRef.current) {
        nombreInputRef.current.focus();
        nombreInputRef.current.style.borderColor = 'var(--red)';
        setTimeout(() => {
          if (nombreInputRef.current) {
            nombreInputRef.current.style.borderColor = '';
          }
        }, 2000);
      }
      return;
    }
    if (onConfirm) onConfirm();
  };

  
  const kitItems = cart.filter(item => item.tipo === 'kit' || item.fromKit);
  const piezaItems = cart.filter(item => item.tipo === 'pieza');
  const empItems = cart.filter(item => item.tipo === 'emp' || item.fromEmp);
  const otherItems = cart.filter(item => !item.tipo || (!['kit', 'pieza', 'emp'].includes(item.tipo)));


  const renderCartItem = (item, index) => {
    const colorMap = {
      'Mujer': 'var(--fem)',
      'Hombre': 'var(--masc)',
      'Unisex': 'var(--uni)'
    };
    const color = colorMap[item.genero] || 'var(--gold)';
    const marca = item.marca || item.m || '';
    const sub = item.gama ? `${item.gama} · ${item.genero || ''}` : '';
    const qty = item.cantidad || item.qty || 1;

  
    const handleRemove = () => {
      if (removeFromCart) {
        removeFromCart(item.id); 
      }
    };

    return (
      <div className="d-item" key={`${item.id || index}-${index}`}>
        <span 
          className="di-dot" 
          style={{ background: color }}
          aria-hidden="true"
        />
        <div className="di-info">
          <span className="di-name">
            {item.nombre || item.n || item.name || 'Perfume'}
          </span>
          <span className="di-meta">
            {marca}{sub ? ` · ${sub}` : ''}
          </span>
        </div>
        {item.precio && (
          <span className="di-price">
            ${item.precio.toLocaleString('es-MX')}
          </span>
        )}
        {qty > 1 && (
          <span className="di-qty">×{qty}</span>
        )}
        <button
          type="button"
          className="di-rm"
          onClick={handleRemove}
          aria-label={`Quitar ${item.nombre || item.n || 'producto'} del carrito`}
        >
          ✕
        </button>
      </div>
    );
  };

  const hasKitItems = kitItems.length > 0;
  const hasPiezaItems = piezaItems.length > 0;
  const hasEmpItems = empItems.length > 0;
  const hasOtherItems = otherItems.length > 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`dim ${open ? 'on' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className={`drw ${open ? 'open' : ''}`}
        ref={drawerRef}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drw-title"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="drw-hd">
          <h2 className="drw-title" id="drw-title">Mi pedido</h2>
          <button 
            type="button" 
            className="drw-x" 
            onClick={onClose}
            aria-label="Cerrar pedido"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="drw-body">
          {/* Kit section */}
          {hasKitItems && (
            <div className="d-sec">
              <div className="d-sec-hd">
                <span className="d-slbl">Kit personalizado</span>
                <span className="d-slbl-count">{kitItems.length} perfumes</span>
              </div>
              <div className="d-items">
                {kitItems.map((item, i) => renderCartItem(item, i))}
              </div>
            </div>
          )}

          {/* Piezas section */}
          {hasPiezaItems && (
            <div className="d-sec">
              <div className="d-sec-hd">
                <span className="d-slbl">Piezas únicas</span>
                <span className="d-slbl-count">
                  {piezaItems.reduce((s, i) => s + (i.cantidad || 1), 0)} pieza{piezaItems.reduce((s, i) => s + (i.cantidad || 1), 0) > 1 ? 's' : ''}
                </span>
              </div>
              <div className="d-items">
                {piezaItems.map((item, i) => renderCartItem(item, i))}
              </div>
            </div>
          )}

          {/* Emprendedor section */}
          {hasEmpItems && (
            <div className="d-sec">
              <div className="d-sec-hd">
                <span className="d-slbl">Caja emprendedor</span>
              </div>
              <div className="d-items">
                {empItems.map((item, i) => renderCartItem(item, i))}
              </div>
            </div>
          )}

          {/* Other items */}
          {hasOtherItems && (
            <div className="d-sec">
              <div className="d-sec-hd">
                <span className="d-slbl">Productos</span>
              </div>
              <div className="d-items">
                {otherItems.map((item, i) => renderCartItem(item, i))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {cart.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '32px', marginBottom: '12px', opacity: 0.3 }} role="img" aria-label="carrito vacío">
                🛍️
              </span>
              <p className="d-empty">Tu pedido está vacío</p>
            </div>
          )}

          {/* Total con desglose */}
          {subtotal > 0 && (
            <div className="d-total-block">
              <div className="d-total-text">
                <span className="d-total-lbl">Subtotal</span>
                <span className="d-total-val" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                  ${subtotal.toLocaleString('es-MX')}
                </span>

                <span className="d-total-lbl">IVA (16%)</span>
                <span className="d-total-val" style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                  ${IVA.toLocaleString('es-MX')}
                </span>

                <div style={{ 
                  borderTop: '1px solid var(--border)', 
                  marginTop: '8px', 
                  paddingTop: '8px' 
                }}>
                  <span className="d-total-lbl" style={{ fontSize: '0.5rem' }}>Total del pedido</span>
                  <span className="d-total-val">
                    ${totalPrecio.toLocaleString('es-MX')}
                  </span>
                </div>
                
                <p className="d-total-sub">MXN · Pago contra entrega</p>
              </div>
            </div>
          )}

          {/* Form */}
          {cart.length > 0 && (
            <form className="drw-form" onSubmit={handleSendWhatsApp}>
              <p className="drw-form-hdr">
                Completa tus datos para confirmar tu pedido más rápido 🚀
              </p>

              {/* Nombre */}
              <div className="drw-form-group">
                <label htmlFor="drw-nombre">Nombre</label>
                <input
                  ref={nombreInputRef}
                  className="d-inp"
                  id="drw-nombre"
                  name="nombre"
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={onInputChange}
                  autoComplete="name"
                  required
                />
              </div>

              {/* Tipo de entrega */}
              <div className="drw-form-group">
                <label>Tipo de entrega</label>
                <div className="d-entrega-opts">
                  {['Envío a domicilio', 'Entrega personal'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`d-entrega-btn ${formData.tipoEntrega === opt ? 'active' : ''}`}
                      onClick={() => {
                        const event = {
                          target: {
                            name: 'tipoEntrega',
                            value: opt
                          }
                        };
                        onInputChange(event);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dirección (envío) */}
              {formData.tipoEntrega === 'Envío a domicilio' && (
                <div className="drw-form-group">
                  <label htmlFor="drw-dir">Dirección completa</label>
                  <input
                    className="d-inp"
                    id="drw-dir"
                    name="direccion"
                    type="text"
                    placeholder="Ej: Av. Patria 123, Col. Jardines Universidad, CP 45110"
                    value={formData.direccion || ''}
                    onChange={onInputChange}
                    autoComplete="street-address"
                  />
                </div>
              )}

              {/* Punto de entrega */}
              {formData.tipoEntrega === 'Entrega personal' && (
                <div className="drw-form-group">
                  <label htmlFor="drw-punto">Punto de entrega</label>
                  <select
                    className="d-inp d-sel"
                    id="drw-punto"
                    name="puntoEntrega"
                    value={formData.puntoEntrega || ''}
                    onChange={onInputChange}
                  >
                    <option value="">Selecciona un punto…</option>
                    <option value="Andares">Andares</option>
                    <option value="Nueva Galicia">Nueva Galicia</option>
                    <option value="Bugambilias">Bugambilias</option>
                    <option value="ITESO">ITESO</option>
                    <option value="UP">UP</option>
                  </select>
                </div>
              )}

              {/* Detalles adicionales */}
              <div className="drw-form-group">
                <label htmlFor="drw-detalle">Detalles adicionales (opcional)</label>
                <textarea
                  className="d-inp d-area"
                  id="drw-detalle"
                  name="detalles"
                  rows={2}
                  placeholder="Referencias, horario de entrega, instrucciones especiales…"
                  value={formData.detalles}
                  onChange={onInputChange}
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="drw-ft">
          <button
            type="button"
            className="btn-wa"
            disabled={cart.length === 0}
            onClick={handleSendWhatsApp}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Pedir por WhatsApp
          </button>
          <p className={`wa-hint ${formData.tipoEntrega && cart.length > 0 ? 'show' : ''}`}>
            {cart.length > 0 ? 'Abriendo WhatsApp con tu pedido...' : ''}
          </p>
          <button
            type="button"
            className="btn-clr"
            style={confirmClear ? { borderColor: 'var(--red)', color: 'var(--red)' } : {}}
            onClick={handleClearCart}
          >
            {confirmClear ? '¿Seguro? Toca de nuevo' : 'Vaciar pedido'}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;