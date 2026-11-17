import AuthForm from '../components/AuthForm';

// Landing Page & Auth : Split-Layout immersif Obsidian & Spring Emerald
function AuthPage({ onLoginSuccess }) {
  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      {/* Panneau Gauche : Ambiance Obsidian (#090D10) & Spring Emerald */}
      <div
        className="col-12 col-lg-6 text-white p-4 p-md-5 d-flex flex-column justify-content-between position-relative overflow-hidden"
        style={{
          backgroundColor: '#090D10',
          minHeight: '380px',
        }}
      >
        {/* Éléments de fond texturés discrets */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(0, 210, 106, 0.12) 0%, transparent 70%)',
            top: '-80px',
            left: '-80px',
            pointerEvents: 'none',
          }}
        ></div>

        {/* En-tête Brand */}
        <div className="position-relative z-1">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-2 bg-success text-white fw-bold"
              style={{ width: '32px', height: '32px', fontSize: '1rem' }}
            >
              <i className="bi bi-geo-alt-fill"></i>
            </span>
            <span className="fs-5 fw-bold tracking-tight text-white">
              VTC<span className="text-success">Express</span>
            </span>
          </div>
          <span className="badge rounded-pill border border-dark-subtle text-light-emphasis bg-dark px-3 py-1.5 small fw-normal">
            <span className="d-inline-block rounded-circle bg-success me-1.5" style={{ width: '7px', height: '7px' }}></span>
            Réseau Actif • Agadir & Région
          </span>
        </div>

        {/* Cœur visuel éditorial */}
        <div className="my-auto py-5 position-relative z-1" style={{ maxWidth: '480px' }}>
          <h1 className="display-5 fw-bold lh-1 tracking-tight mb-3 text-white">
            Déplacez-vous librement. <br />
            <span className="text-success">Négociez votre tarif.</span>
          </h1>
          <p className="text-secondary fs-6 leading-relaxed mb-4">
            L'alternative moderne inspirée d'inDrive et d'Uber. Pour les passagers qui veulent le juste prix et les chauffeurs maîtres de leur activité.
          </p>

          {/* Micro-indicateurs de confiance */}
          <div className="d-flex gap-4 pt-3 border-top border-dark">
            <div>
              <div className="fs-4 fw-bold text-white mb-0">100%</div>
              <div className="text-secondary small">Tarif transparent</div>
            </div>
            <div>
              <div className="fs-4 fw-bold text-white mb-0">Direct</div>
              <div className="text-secondary small">Chauffeur certifié</div>
            </div>
            <div>
              <div className="fs-4 fw-bold text-white mb-0">24/7</div>
              <div className="text-secondary small">Disponibilité</div>
            </div>
          </div>
        </div>

        {/* Footer Panneau Gauche */}
        <div className="position-relative z-1 text-secondary small pt-3 d-flex justify-content-between align-items-center">
          <span>Module Prog. Web Dynamique • S5 IL</span>
          <span>FSA Agadir</span>
        </div>
      </div>

      {/* Panneau Droit : Formulaire d'accès & Connexion (Surface pure, claire et tactile) */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4 p-md-5 bg-white">
        <AuthForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
}

export default AuthPage;
