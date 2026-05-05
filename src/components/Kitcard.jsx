const Kitcard = ({
  cantidad,
  descripcion,
  reglas,
  precio,
  precioUnidad,
  selected,
  onSelect
}) => {
  return (
    <div
      className={`kit-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="kit-img"></div>

      <div className="kit-info">
        <h3>{cantidad} <span>minis</span></h3>

        <p className="desc">{descripcion}</p>

        <ul className="rules">
          {reglas.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>

        <div className="price">
          <h4>${precio} <span>MXN</span></h4>
          <p>${precioUnidad} por pieza</p>
        </div>

        <button>Elegir caja de {cantidad}</button>
      </div>
    </div>
  );
};

export default Kitcard;