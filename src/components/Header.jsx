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
