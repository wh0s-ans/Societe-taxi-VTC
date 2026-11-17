// Carte Course : présentation hiérarchique, contrastée et sans éléments superflus
function CarteCourse({ course, roleActuel, onChangerStatut, onSupprimer }) {
  const getBadgeConfig = (statut) => {
    switch (statut) {
      case 'En attente':
        return { className: 'badge-status-attente', icon: 'bi-hourglass-split' };
      case 'Acceptée':
        return { className: 'badge-status-acceptee', icon: 'bi-check2' };
      case 'En cours':
        return { className: 'badge-status-cours', icon: 'bi-geo-alt-fill' };
      case 'Terminée':
        return { className: 'badge-status-terminee', icon: 'bi-flag-fill' };
      case 'Annulée':
        return { className: 'badge-status-annulee', icon: 'bi-x' };
      default:
        return { className: 'bg-light text-dark', icon: 'bi-dot' };
    }
  };

  const badge = getBadgeConfig(course.statut);

  return (
    <article className="ui-card ui-card-interactive p-3.5 mb-3">
      {/* En-tête : Badge catégorie, statut et tarif en grand */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-dark text-white px-2.5 py-1 rounded-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
            {course.typeVehicule || 'Standard'}
          </span>
          <span className={`badge-status ${badge.className}`}>
            <i className={`bi ${badge.icon}`}></i>
            {course.statut}
          </span>
        </div>
        <div className="font-display">
          <span className="fs-4 fw-bold" style={{ color: 'var(--color-brand-deep)' }}>
            {course.prix}
          </span>
          <span className="text-muted fw-semibold small ms-1">MAD</span>
        </div>
      </div>

      {/* Trajet visualisé : Départ & Destination */}
      <div className="border-start border-2 ms-2 ps-3 my-2" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mb-2">
          <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>PRISE EN CHARGE</div>
          <div className="fw-semibold text-dark" style={{ fontSize: '0.925rem' }}>{course.depart}</div>
        </div>
        <div>
          <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>DESTINATION</div>
          <div className="fw-semibold text-dark" style={{ fontSize: '0.925rem' }}>{course.arrivee}</div>
        </div>
      </div>

      {/* Détails du Passager & Chauffeur */}
      <div className="d-flex align-items-center justify-content-between bg-light rounded-2 px-3 py-2 my-3 text-secondary small">
        <span className="d-inline-flex align-items-center gap-1.5">
          <i className="bi bi-person text-dark"></i>
          <span className="text-dark fw-medium">{course.nomClient || 'Passager'}</span>
        </span>
        <span className="d-inline-flex align-items-center gap-1 font-monospace">
          <i className="bi bi-telephone text-muted"></i>
          {course.telephoneClient || '0600000000'}
        </span>
      </div>

      {course.chauffeur && (
        <div className="p-2.5 mb-3 rounded-2 border border-success border-opacity-25 bg-success bg-opacity-10 small">
          <div className="fw-bold text-dark d-flex align-items-center gap-1.5 mb-0.5">
            <i className="bi bi-shield-check text-success"></i>
            Chauffeur : {course.chauffeur.nom}
          </div>
          <div className="text-secondary">{course.chauffeur.vehicule}</div>
        </div>
      )}

      {/* Actions selon le rôle */}
      {roleActuel === 'chauffeur' && (
        <div className="pt-1">
          {course.statut === 'En attente' && (
            <button
              className="btn-brand-primary w-100 py-2 fs-6"
              onClick={() =>
                onChangerStatut(course.id, 'Acceptée', {
                  nom: 'Chauffeur Partenaire',
                  vehicule: 'Toyota Corolla (12345-A-33)',
                })
              }
            >
              <i className="bi bi-check2-circle me-1.5"></i> Accepter la course
            </button>
          )}

          {course.statut === 'Acceptée' && (
            <button
              className="btn btn-dark w-100 py-2 rounded-3 fw-semibold"
              onClick={() => onChangerStatut(course.id, 'En cours')}
            >
              <i className="bi bi-play-circle me-1.5"></i> Démarrer la course
            </button>
          )}

          {course.statut === 'En cours' && (
            <button
              className="btn btn-success w-100 py-2 rounded-3 fw-semibold"
              onClick={() => onChangerStatut(course.id, 'Terminée')}
            >
              <i className="bi bi-flag-fill me-1.5"></i> Terminer la course
            </button>
          )}
        </div>
      )}

      {roleActuel === 'passager' && course.statut === 'En attente' && (
        <div className="pt-1">
          <button
            className="btn btn-outline-danger btn-sm w-100 rounded-3 py-1.5 fw-medium"
            onClick={() => onSupprimer(course.id)}
          >
            <i className="bi bi-x-circle me-1"></i> Annuler ma demande
          </button>
        </div>
      )}
    </article>
  );
}

export default CarteCourse;
