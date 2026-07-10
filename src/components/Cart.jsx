import { useState } from "react";
import { useCart } from "../context/useCart";
import CartDrawer from "./CartDrawer";

export default function Cart({ open, onClose }) {
  const { cart, removeFromCart, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    nombre: "",
    tipoEntrega: "Envío a domicilio",
    direccion: "",
    puntoEntrega: "",
    detalles: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsApp = () => {
    if (cart.length === 0) return;
    if (!formData.nombre.trim()) return;

    const telefono = "523318279255";
    let mensaje = `¡Hola! Soy ${formData.nombre}, quiero mi pedido:\n\n`;
    
    // Agrupar items por tipo
    const kitItems = cart.filter(item => item.tipo === 'kit' || item.fromKit);
    const piezaItems = cart.filter(item => item.tipo === 'pieza');
    const empItems = cart.filter(item => item.tipo === 'emp' || item.fromEmp);

    // Kit personalizado
    if (kitItems.length > 0) {
      mensaje += `📦 KIT PERSONALIZADO:\n`;
      kitItems.forEach((item, i) => {
        const nombre = item.nombre || item.n || 'Perfume';
        const marca = item.marca || item.m || '';
        mensaje += `  ${i + 1}. ${nombre} - ${marca}\n`;
      });
      mensaje += '\n';
    }

    // Piezas únicas
    if (piezaItems.length > 0) {
      mensaje += `💎 PIEZAS ÚNICAS:\n`;
      piezaItems.forEach((item, i) => {
        const nombre = item.nombre || item.n || 'Perfume';
        const marca = item.marca || item.m || '';
        const qty = item.cantidad || 1;
        const precio = item.precio || 0;
        mensaje += `  ${i + 1}. ${nombre} - ${marca} ×${qty} ($${precio.toLocaleString('es-MX')}/pieza)\n`;
      });
      mensaje += '\n';
    }

    // Caja emprendedor
    if (empItems.length > 0) {
      mensaje += `🚀 CAJA EMPRENDEDOR:\n`;
      empItems.forEach((item, i) => {
        const nombre = item.nombre || 'Caja';
        const qty = item.cantidad || 1;
        mensaje += `  ${i + 1}. ${nombre} ×${qty}\n`;
      });
      mensaje += '\n';
    }

    // Datos de entrega
    const destino = formData.tipoEntrega === 'Envío a domicilio' 
      ? formData.direccion 
      : formData.puntoEntrega;

    mensaje += `*Entrega:* ${formData.tipoEntrega}`;
    if (destino) mensaje += `\n*Dirección:* ${destino}`;
    if (formData.detalles) mensaje += `\n*Detalles:* ${formData.detalles}`;
    
    // Calcular totales
    const subtotal = cart.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    mensaje += `\n\n*Subtotal:* $${subtotal.toLocaleString('es-MX')} MXN`;
    mensaje += `\n*IVA (16%):* $${iva.toLocaleString('es-MX')} MXN`;
    mensaje += `\n*Total:* $${total.toLocaleString('es-MX')} MXN`;
    mensaje += `\n\nGracias! 🤍`;

    // CORRECCIÓN: Usar window.open SIN fallback a location.href
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <CartDrawer 
      open={open} 
      onClose={onClose}
      cart={cart}
      removeFromCart={removeFromCart}
      clearCart={clearCart}
      formData={formData}
      onInputChange={handleInputChange}
      onConfirm={handleWhatsApp}
    />
  );
}