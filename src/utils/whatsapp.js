export const sendToWhatsApp = (cart) => {
  const phone = "3334751285"; 

  let message = "Hola, quiero pedir:\n\n";

  cart.forEach((item) => {
    message += `• ${item.nombre} (${item.marca})\n`;
  });

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};