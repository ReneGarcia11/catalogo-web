import HeroLoop from "./HeroLoop";

export default function Hero({ onNavigate }) {
  return (
    <section className="hero">
      <div className="hero-overlay">
        <p className="hero-top">
          PERFUMES MINIS DE DISEÑADOR · 100% ORIGINALES
        </p>

        <h1>
          Arma tu kit de <br />
          <span>fragancias</span>
        </h1>

        <p className="hero-sub">
          Para regalo, coleccionar o emprender · Guadalajara
        </p>

        <HeroLoop onNavigate={onNavigate} />
      </div>
    </section>
  );
}