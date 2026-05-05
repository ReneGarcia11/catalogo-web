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
    
   
    const kitItems = cart.filter(item => item.tipo === 'kit' || item.fromKit);
    const piezaItems = cart.filter(item => item.tipo === 'pieza');
    const empItems = cart.filter(item => item.tipo === 'emp' || item.fromEmp);

    if (kitItems.length > 0) {
      mensaje += `📦 KIT PERSONALIZADO:\n`;
      kitItems.forEach((item, i) => {
        mensaje += `  ${i + 1}. ${item.nombre} - ${item.marca || ''}\n`;
      });
      mensaje += '\n';
    }

    if (piezaItems.length > 0) {
      mensaje += `💎 PIEZAS ÚNICAS:\n`;
      piezaItems.forEach((item, i) => {
        const qty = item.cantidad || 1;
        mensaje += `  ${i + 1}. ${item.nombre} - ${item.marca || ''} ×${qty}\n`;
      });
      mensaje += '\n';
    }

    if (empItems.length > 0) {
      mensaje += `🚀 CAJA EMPRENDEDOR:\n`;
      empItems.forEach((item, i) => {
        mensaje += `  ${i + 1}. ${item.nombre || 'Caja'} ×${item.cantidad || 1}\n`;
      });
      mensaje += '\n';
    }

    const destino = formData.tipoEntrega === 'Envío a domicilio' 
      ? formData.direccion 
      : formData.puntoEntrega;

    mensaje += `*Entrega:* ${formData.tipoEntrega}`;
    if (destino) mensaje += `\n*Dirección:* ${destino}`;
    if (formData.detalles) mensaje += `\n*Detalles:* ${formData.detalles}`;
    
    const total = cart.reduce((sum, item) => sum + (item.precio || 0) * (item.cantidad || 1), 0);
    mensaje += `\n*Total:* $${total.toLocaleString('es-MX')} MXN`;
    mensaje += `\n\nGracias! 🤍`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w || w.closed || typeof w.closed === "undefined") {
      window.location.href = url;
    }
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