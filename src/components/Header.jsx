import { useCart } from "../context/useCart";

export default function Header({ onOpenCart }) {
  const { cart } = useCart();
  
  // Calcular el total de items (sumando cantidades)
  const totalItems = cart.reduce((total, item) => {
    return total + (item.cantidad || 1);
  }, 0);

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo al lado izquierdo */}
        <a href="/" className="header-logo">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="header-logo-img"
          />
        </a>

        {/* Botones al lado derecho */}
        <div className="header-actions">
          <a 
            href="/panel" 
            className="panel-btn"
            aria-label="Ir al panel"
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              strokeLinecap="round" 
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="panel-btn-text">PANEL</span>
          </a>

          <button 
            className="cart-btn" 
            onClick={onOpenCart}
            aria-label={`Mi pedido, ${totalItems} artículos`}
          >
            MI PEDIDO
            {totalItems > 0 && (
              <span className="cart-count">{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}