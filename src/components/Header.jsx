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

        {/* Botón del carrito al lado derecho */}
        <button className="cart-btn" onClick={onOpenCart}>
          MI PEDIDO
          {totalItems > 0 && (
            <span className="cart-count">{totalItems}</span>
          )}
        </button>
      </div>
    </header>
  );
}