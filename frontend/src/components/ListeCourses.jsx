import { useState } from 'react';
import CarteCourse from './CarteCourse';

// Gestionnaire de liste et filtres avec retour d'état vide soigné
function ListeCourses({ courses, roleActuel, onChangerStatut, onSupprimer }) {
  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('tous');

  const coursesFiltrees = courses.filter((c) => {
    const correspondRecherche =
      c.depart.toLowerCase().includes(recherche.toLowerCase()) ||
      c.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
      c.nomClient.toLowerCase().includes(recherche.toLowerCase());

    const correspondStatut =
      filtreStatut === 'tous' ? true : c.statut === filtreStatut;

    return correspondRecherche && correspondStatut;
  });

  return (
    <div>
      {/* Panneau de recherche & Filtres horizontaux */}
      <div className="ui-card p-3 mb-3">
        <div className="input-group mb-2.5">
          <span className="input-group-text bg-white border-end-0 text-secondary">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control form-control-custom border-start-0"
            placeholder="Filtrer par adresse ou passager..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          {recherche && (
            <button
              className="btn btn-outline-secondary border-start-0 bg-white"
              type="button"
              onClick={() => setRecherche('')}
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>

        {/* Pilules de statut interactives */}
        <div className="d-flex gap-1.5 overflow-auto py-1" style={{ scrollbarWidth: 'none' }}>
          {['tous', 'En attente', 'Acceptée', 'En cours', 'Terminée'].map((statut) => {
            const actif = filtreStatut === statut;
            return (
              <button
                key={statut}
                type="button"
                className={`btn btn-sm text-nowrap rounded-pill px-3 fw-medium ${
                  actif
                    ? 'btn-dark'
                    : 'btn-light border text-secondary'
                }`}
                style={{ fontSize: '0.785rem' }}
                onClick={() => setFiltreStatut(statut)}
              >
                {statut === 'tous' ? 'Toutes les courses' : statut}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendu des éléments ou état vide soigné */}
      {coursesFiltrees.length === 0 ? (
        <div className="ui-card p-5 text-center text-secondary">
          <div className="d-inline-flex p-3 rounded-circle bg-light mb-3">
            <i className="bi bi-inbox fs-3 text-muted"></i>
          </div>
          <h4 className="fs-6 fw-bold text-dark mb-1">Aucune course trouvée</h4>
          <p className="small text-muted mb-0">
            {recherche ? 'Essayez de modifier votre mot-clé de recherche.' : 'Aucun trajet n\'est actuellement disponible dans cette catégorie.'}
          </p>
        </div>
      ) : (
        coursesFiltrees.map((course) => (
          <CarteCourse
            key={course.id}
            course={course}
            roleActuel={roleActuel}
            onChangerStatut={onChangerStatut}
            onSupprimer={onSupprimer}
          />
        ))
      )}
    </div>
  );
}

export default ListeCourses;
