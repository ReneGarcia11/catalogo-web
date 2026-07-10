const Menu = ({ active, setActive }) => {
  return (
    <div className="menu">
      <button
        className={active === "kits" ? "active" : ""}
        onClick={() => setActive("kits")}
      >
        🌹 KITS
      </button>

      <button
        className={active === "piezas" ? "active" : ""}
        onClick={() => setActive("piezas")}
      >
        ✦ PIEZAS ÚNICAS
      </button>

      <button
        className={active === "emprendedor" ? "active" : ""}
        onClick={() => setActive("emprendedor")}
      >
        💼 EMPRENDEDOR
      </button>
    </div>
  );
};

export default Menu;