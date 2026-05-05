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
          : tipo === "masc"
          ? "Caja Masculina (20 piezas)"
          : "Caja Mixta (20 piezas)",
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
        }

        .emp-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .emp-header p {
          letter-spacing: 3px;
          font-size: 11px;
          color: #9c8c7a;
        }

        .emp-header h2 {
          font-size: 42px;
          font-weight: 400;
          margin: 10px 0;
        }

        .emp-header span {
          font-style: italic;
          color: #c8a96a;
        }

        .emp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .emp-card {
          background: #fff;
          padding: 40px;
          border: 1px solid #e8decf;
        }

        .emp-card h3 {
          font-size: 28px;
          font-weight: 400;
        }

        .emp-card h3 span {
          font-size: 14px;
          color: #9c8c7a;
        }

        .emp-card h4 {
          margin: 10px 0;
          font-size: 18px;
        }

        .emp-card p {
          font-size: 14px;
          color: #6b6055;
          margin-bottom: 20px;
        }

        .emp-price {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .emp-price span {
          font-size: 12px;
          margin-left: 10px;
          background: #f0e7da;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .emp-card ul {
          margin: 20px 0;
          padding-left: 18px;
        }

        .emp-card li {
          margin-bottom: 8px;
          font-size: 13px;
        }

        .emp-btn {
          width: 100%;
          padding: 14px;
          border: 1px solid #c8a96a;
          background: transparent;
          color: #000;
          letter-spacing: 2px;
          cursor: pointer;
          transition: 0.2s;
        }

        .emp-btn:hover {
          background: #c8a96a;
          color: white;
        }
      `}</style>

      <div className="emp-header">
        <p>PARA EMPRENDEDORES</p>
        <h2>
          Caja <span>emprendedor</span>
        </h2>
        <p>20 piezas · 3 opciones · Precio mayoreo</p>
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
            SELECCIONAR CAJA
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
            SELECCIONAR CAJA
          </button>
        </div>

        {/* MIXTA */}
        <div className="emp-card">
          <h3>20 <span>piezas</span></h3>
          <h4>Caja Mixta</h4>
          <p>
            Lo mejor de ambos mundos. 10 femeninas + 10 masculinas
            para máxima variedad de clientes.
          </p>

          <div className="emp-price">
            $6,800 <span>$340/pieza</span>
          </div>

          <ul>
            <li>10 femeninas + 10 masculinas</li>
            <li>20 piezas originales</li>
            <li>Precio mayoreo garantizado</li>
          </ul>

          <button className="emp-btn" onClick={() => handleAdd("mix")}>
            SELECCIONAR CAJA
          </button>
        </div>
      </div>
    </section>
  );
};

export default Emprendedor;