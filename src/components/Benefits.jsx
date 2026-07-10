import React from 'react'

const items = [
  { icon: '🎁', title: 'Regalo perfecto', text: 'Una caja personalizada que se siente lujosa' },
  { icon: '✈️', title: 'Para viajar', text: 'Mini ideal para bolso o cambiar fragancia cada día' },
  { icon: '🌹', title: 'Prueba primero', text: 'Descubre si un perfume es para ti antes del frasco grande' },
  { icon: '💼', title: 'Emprende', text: 'Paquetes listos para revender en tu negocio' },
]

const Benefits = () => {
  return (
    <section className="benefits">
      {items.map((item) => (
        <div className="benefit" key={item.title}>
          <span className="benefit-icon" aria-hidden="true">{item.icon}</span>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      ))}
    </section>
  )
}

export default Benefits
