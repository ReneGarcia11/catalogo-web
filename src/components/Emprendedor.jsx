import React from "react";
import { useCart } from "../context/useCart";

const Emprendedor = ({ openCart }) => {
  const { addToCart } = useCart();

  const handleAdd = (tipo) => {
    const caja = {
      id: Date.now(),
      nombre:
        tipo === "fem"
          ? "Caja Femenina (20 piezas)"
          : "Caja Masculina (20 piezas)",
      precio: 6800,
      tipo: "emp",
      cantidad: 1,
    };

    addToCart(caja);

    if (openCart) {
      openCart();
    }
  };

  return (
    <section className="emp">
      <style>{`
        .emp {
          padding: 80px 40px;
          background: #f7f2ec;
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
        }

        .emp-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .emp-header p {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          letter-spacing: 3px;
          font-size: 11px;
          color: #9c8c7a;
        }

        .emp-header h2 {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 42px;
          font-weight: 400;
          margin: 10px 0;
          color: #18140f;
        }

        .emp-header h2 span {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-style: italic;
          color: #c8a96a;
        }

        .emp-header h2 + p {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: 13px;
          color: #9c8c7a;
          letter-spacing: 0.5px;
        }

        .emp-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          max-width: 900px;
          margin: 0 auto;
        }

        .emp-card {
          background: #fff;
          padding: 40px;
          border: 1px solid #e8decf;
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
        }

        .emp-card h3 {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 42px;
          font-weight: 400;
          color: #18140f;
          margin: 0;
          line-height: 1;
        }

        .emp-card h3 span {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 16px;
          font-style: italic;
          color: #9c8c7a;
        }

        .emp-card h4 {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 18px;
          font-weight: 400;
          color: #18140f;
          margin: 10px 0;
        }

        .emp-card p {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #6b6055;
          margin-bottom: 20px;
          line-height: 1.6;
          font-weight: 300;
        }

        .emp-price {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 28px;
          margin-bottom: 20px;
          color: #18140f;
          font-weight: 300;
        }

        .emp-price span {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: 11px;
          margin-left: 10px;
          background: rgba(184, 154, 94, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          color: #b89a5e;
          font-weight: 400;
        }

        .emp-card ul {
          margin: 20px 0;
          padding: 0;
          list-style: none;
        }

        .emp-card ul li {
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          margin-bottom: 8px;
          font-size: 13px;
          color: #6b6055;
          font-weight: 300;
          padding-left: 14px;
          position: relative;
        }

        .emp-card ul li::before {
          content: "";
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 5px;
          height: 5px;
          background: #b89a5e;
          border-radius: 50%;
        }

        .emp-btn {
          width: 100%;
          padding: 14px;
          border: 1px solid #b89a5e;
          background: transparent;
          color: #18140f;
          font-family: "DM Sans", system-ui, -apple-system, sans-serif;
          font-size: 9px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.22s;
          border-radius: 2px;
          font-weight: 500;
        }

        .emp-btn:hover {
          background: #18140f;
          color: #b89a5e;
          border-color: #18140f;
        }

        @media (max-width: 768px) {
          .emp {
            padding: 60px 20px;
          }

          .emp-grid {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .emp-header h2 {
            font-size: 34px;
          }

          .emp-card h3 {
            font-size: 36px;
          }
        }

        @media (max-width: 480px) {
          .emp {
            padding: 40px 16px;
          }

          .emp-card {
            padding: 28px;
          }
        }
      `}</style>

      <div className="emp-header">
        <p>PARA EMPRENDEDORES</p>
        <h2>
          Caja <span>emprendedor</span>
        </h2>
        <p>20 piezas · 2 opciones · Precio mayoreo</p>
      </div>

      <div className="emp-grid">
        {/* FEMENINA */}
        <div className="emp-card">
          <h3>20 <span>piezas</span></h3>
          <h4>Caja Femenina</h4>
          <p>
            20 minis seleccionados de las gamas más populares para mujer.
            Mix curado listo para vender.
          </p>

          <div className="emp-price">
            $6,800 <span>$340/pieza</span>
          </div>

          <ul>
            <li>Mix exclusivo de fragancias mujer</li>
            <li>20 piezas originales</li>
            <li>Precio mayoreo garantizado</li>
          </ul>

          <button className="emp-btn" onClick={() => handleAdd("fem")}>
            Seleccionar caja
          </button>
        </div>

        {/* MASCULINA */}
        <div className="emp-card">
          <h3>20 <span>piezas</span></h3>
          <h4>Caja Masculina</h4>
          <p>
            20 minis de las fragancias más solicitadas para hombre.
            Perfectas para regalo o reventa.
          </p>

          <div className="emp-price">
            $6,800 <span>$340/pieza</span>
          </div>

          <ul>
            <li>Mix exclusivo de fragancias hombre</li>
            <li>20 piezas originales</li>
            <li>Precio mayoreo garantizado</li>
          </ul>

          <button className="emp-btn" onClick={() => handleAdd("masc")}>
            Seleccionar caja
          </button>
        </div>
      </div>
    </section>
  );
};

export default Emprendedor;