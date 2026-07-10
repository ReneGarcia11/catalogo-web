const BackButton = ({ onClick, label = "Atrás", fixed = true }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={fixed ? "back-nav-btn back-nav-btn--fixed" : "back-nav-btn"}
      aria-label={label}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
