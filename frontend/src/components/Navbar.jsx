// Navbar de l'application : En-tête avec profil utilisateur et bouton de déconnexion
function Navbar({ utilisateur, onDeconnexion }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3 shadow-sm" style={{ backgroundColor: '#090D10' }}>
      <div className="container">
        {/* Logo VTC Express */}
        <a className="navbar-brand d-flex align-items-center fw-bold fs-4" href="#">
          <i className="bi bi-geo-alt-fill text-success me-2"></i>
          <span>VTC<span className="text-success">Express</span></span>
        </a>

        {/* Profil utilisateur connecté & Déconnexion */}
        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-sm-block">
            <div className="text-white fw-semibold small">{utilisateur?.nom || utilisateur?.email}</div>
            <div className="badge bg-success-subtle text-success small rounded-pill px-2">
              {utilisateur?.role === 'chauffeur' ? 'Chauffeur Partenaire' : 'Passager'}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-light btn-sm rounded-pill px-3 py-1.5"
            onClick={onDeconnexion}
            title="Se déconnecter"
          >
            <i className="bi bi-box-arrow-right me-1"></i>
            <span className="d-none d-sm-inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
