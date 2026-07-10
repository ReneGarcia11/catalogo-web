export const sendToWhatsApp = (cart) => {
  const numerowhats = import.meta.env.NUMERO_WHATSAPP

  let message = "Hola, quiero pedir:\n\n";

  cart.forEach((item) => {
    message += `• ${item.nombre} (${item.marca})\n`;
  });

  const url = `https://wa.me/${numerowhats}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
};