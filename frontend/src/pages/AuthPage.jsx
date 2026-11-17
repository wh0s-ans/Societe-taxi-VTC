import AuthForm from '../components/AuthForm';

// Page de bienvenue & authentification en Split-Layout (Obsidian & Spring Emerald)
// Mobile : Panneau supérieur bien dosé au ratio 3:2 avec aération et élégance
// Desktop : Split 50/50 plein écran
function AuthPage({ onLoginSuccess }) {
  return (
    <div className="min-vh-100 d-flex flex-column flex-lg-row bg-white">
      {/* Panneau Brand & Expérience
          Sur mobile : donne une présence affirmée (ratio ~3:2) avec un bon confort visuel
          Sur desktop : 50% de la largeur, pleine hauteur */}
      <div
        className="col-12 col-lg-6 text-white px-4 py-4 p-sm-5 d-flex flex-column justify-content-between position-relative overflow-hidden"
        style={{
          backgroundColor: '#090D10',
          minHeight: '260px',
        }}
      >
        {/* Lueur d'ambiance en arrière-plan */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: '420px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(0, 210, 106, 0.15) 0%, transparent 70%)',
            top: '-90px',
            left: '-90px',
            pointerEvents: 'none',
          }}
        ></div>

        {/* En-tête Logo */}
        <div className="position-relative z-1 d-flex align-items-center justify-content-between mb-3 mb-lg-0">
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-2 bg-success text-white fw-bold shadow-sm"
              style={{ width: '32px', height: '32px', fontSize: '1rem' }}
            >
              <i className="bi bi-geo-alt-fill"></i>
            </span>
            <span className="fs-5 fw-bold tracking-tight text-white">
              VTC<span className="text-success">Express</span>
            </span>
          </div>

          <span className="badge rounded-pill border border-dark-subtle text-light-emphasis bg-dark px-2.5 py-1.5 small fw-normal">
            <span className="d-inline-block rounded-circle bg-success me-1.5" style={{ width: '6px', height: '6px' }}></span>
            Réseau Urbain
          </span>
        </div>

        {/* Cœur éditorial avec un peu plus d'ampleur et de hauteur */}
        <div className="my-auto py-2 py-lg-4 position-relative z-1" style={{ maxWidth: '480px' }}>
          <h1 className="fw-bold tracking-tight mb-2 mb-lg-3 text-white lh-sm" style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)', letterSpacing: '-0.5px' }}>
            Déplacez-vous librement. <br />
            <span className="text-success">Négociez votre tarif.</span>
          </h1>

          <p className="text-secondary fs-6 leading-relaxed mb-3 mb-lg-4 d-none d-sm-block">
            L'alternative moderne inspirée d'inDrive et d'Uber. Pour les passagers qui veulent le juste prix et les chauffeurs maîtres de leur activité.
          </p>

          {/* Micro-indicateurs de confiance bien proportionnés */}
          <div className="d-flex gap-4 pt-3 border-top border-dark">
            <div>
              <div className="fw-bold text-white mb-0" style={{ fontSize: '1.25rem' }}>100%</div>
              <div className="text-secondary" style={{ fontSize: '0.78rem' }}>Tarif transparent</div>
            </div>
            <div>
              <div className="fw-bold text-white mb-0" style={{ fontSize: '1.25rem' }}>Direct</div>
              <div className="text-secondary" style={{ fontSize: '0.78rem' }}>Chauffeur certifié</div>
            </div>
            <div>
              <div className="fw-bold text-white mb-0" style={{ fontSize: '1.25rem' }}>24/7</div>
              <div className="text-secondary" style={{ fontSize: '0.78rem' }}>Disponibilité</div>
            </div>
          </div>
        </div>

        {/* Pied de page du panneau sombre (visible sur grand écran) */}
        <div className="position-relative z-1 text-secondary small pt-3 d-none d-lg-flex justify-content-between align-items-center border-top border-dark">
          <span>Plateforme de Transport Urbain</span>
          <span>Version 2.0</span>
        </div>
      </div>

      {/* Panneau Droit : Formulaire de connexion / inscription */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-3 p-sm-4 p-md-5 bg-white flex-grow-1">
        <AuthForm onLoginSuccess={onLoginSuccess} />
      </div>
    </div>
  );
}

export default AuthPage;
