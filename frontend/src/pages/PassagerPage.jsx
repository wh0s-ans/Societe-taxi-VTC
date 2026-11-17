import { useState } from 'react';
import Course from '../models/Course';

/* Types de véhicules avec multiplicateurs de tarif */
const TYPES_VEHICULE = [
  { id: 'Standard', label: 'Course', icone: '🚕', desc: 'Économique', multiplicateur: 1.0 },
  { id: 'Moto',     label: 'Moto',   icone: '🏍️', desc: 'Rapide',     multiplicateur: 0.7 },
  { id: 'Confort',  label: 'Confort', icone: '🚗', desc: 'Premium',   multiplicateur: 1.3 },
  { id: 'Van',      label: 'Van',     icone: '🚐', desc: 'Groupe',    multiplicateur: 1.6 },
];

/* Destinations récentes simulées (sera remplacé par l'historique API) */
const DESTINATIONS_RECENTES = [
  { nom: 'Centre Commercial',  icone: 'bi-bag-fill' },
  { nom: 'Gare Routière',      icone: 'bi-bus-front-fill' },
  { nom: 'Hôpital Régional',   icone: 'bi-hospital-fill' },
  { nom: 'Aéroport',           icone: 'bi-airplane-fill' },
];

/* ─── Barre de navigation intégrée (dark) ─────────────────────────── */
function NavbarDark({ utilisateur, onDeconnexion }) {
  return (
    <nav
      className="d-flex align-items-center justify-content-between px-4 py-3"
      style={{ background: '#0d1520', borderBottom: '1px solid #1e2d3d' }}
    >
      <div className="d-flex align-items-center gap-2">
        <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>
          <span style={{ color: '#00D26A' }}>VTC</span>Express
        </span>
        <span
          className="badge rounded-pill"
          style={{ background: 'rgba(0,210,106,0.15)', color: '#00D26A', fontSize: '0.68rem' }}
        >
          Passager
        </span>
      </div>

      <div className="d-flex align-items-center gap-3">
        <span className="text-secondary small d-none d-sm-block">{utilisateur?.nom}</span>
        <button
          type="button"
          className="btn btn-sm rounded-pill d-flex align-items-center gap-1"
          style={{ background: '#1e2d3d', color: '#9ca3af', border: 'none', fontSize: '0.8rem' }}
          onClick={onDeconnexion}
        >
          <i className="bi bi-box-arrow-right"></i>
          <span className="d-none d-sm-inline">Déconnexion</span>
        </button>
      </div>
    </nav>
  );
}

/* ─── Étape 1 : Formulaire de réservation style inDrive ────────────── */
function FormulaireCourse({ utilisateur, onValider }) {
  const [depart,      setDepart]      = useState('');
  const [destination, setDestination] = useState('');
  const [typeVehicule, setTypeVehicule] = useState('Standard');
  const [prix, setPrix] = useState(35);
  const [erreur, setErreur] = useState('');

  /* Recalcul du prix selon le type */
  const choisirVehicule = (type) => {
    setTypeVehicule(type.id);
    const base = Course.estimerPrix(5, type.id);
    setPrix(base);
  };

  /* Ajustement manuel du prix */
  const ajusterPrix = (delta) => setPrix((p) => Math.max(10, p + delta));

  /* Remplissage rapide depuis destinations récentes */
  const remplirChamp = (nom) => {
    if (!depart) setDepart(nom);
    else if (!destination) setDestination(nom);
  };

  const handleValider = () => {
    if (!depart.trim() || !destination.trim()) {
      setErreur('Veuillez saisir le départ et la destination.');
      return;
    }
    setErreur('');
    onValider({ depart, destination, typeVehicule, prix });
  };

  const prixEstime = prix + Math.round(prix * 0.15);
  const pret = depart.trim() && destination.trim();

  return (
    <div className="d-flex flex-column" style={{ background: '#111827', minHeight: '100vh' }}>

      {/* ── Sélecteur de véhicule horizontal ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="text-secondary mb-2" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Type de véhicule
        </div>
        <div className="d-flex gap-2 overflow-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {TYPES_VEHICULE.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => choisirVehicule(type)}
              className="d-flex flex-column align-items-center flex-shrink-0 rounded-3 p-2 border-0"
              style={{
                width: '78px',
                background: typeVehicule === type.id ? '#162a1e' : '#1a2332',
                outline: typeVehicule === type.id ? '2px solid #00D26A' : '2px solid transparent',
                transition: 'all 0.18s',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>{type.icone}</span>
              <div
                className="fw-semibold mt-1"
                style={{ fontSize: '0.76rem', color: typeVehicule === type.id ? '#00D26A' : '#fff' }}
              >
                {type.label}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.65rem' }}>{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Champs Départ / Destination ── */}
      <div className="px-4 pb-3">
        <div className="rounded-4 overflow-hidden" style={{ background: '#1e2d3d', border: '1px solid #2d3f52' }}>
          {/* Départ */}
          <div className="d-flex align-items-center px-3 gap-3" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
            <i className="bi bi-circle-fill text-success flex-shrink-0" style={{ fontSize: '0.55rem' }}></i>
            <input
              type="text"
              className="bg-transparent border-0 text-white w-100"
              placeholder="Point de départ"
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              style={{ outline: 'none', fontSize: '0.95rem' }}
            />
            {depart && (
              <button
                type="button"
                className="btn-close btn-close-white opacity-25 flex-shrink-0"
                style={{ fontSize: '0.6rem' }}
                onClick={() => setDepart('')}
              />
            )}
          </div>

          <div style={{ height: '1px', background: '#2d3f52', marginLeft: '44px' }}></div>

          {/* Destination */}
          <div className="d-flex align-items-center px-3 gap-3" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
            <i className="bi bi-geo-alt-fill text-danger flex-shrink-0" style={{ fontSize: '0.95rem' }}></i>
            <input
              type="text"
              className="bg-transparent border-0 text-white w-100"
              placeholder="Où allez-vous ?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={{ outline: 'none', fontSize: '0.95rem' }}
            />
            {destination && (
              <button
                type="button"
                className="btn-close btn-close-white opacity-25 flex-shrink-0"
                style={{ fontSize: '0.6rem' }}
                onClick={() => setDestination('')}
              />
            )}
          </div>
        </div>

        {erreur && (
          <div className="text-danger small mt-2">
            <i className="bi bi-exclamation-circle me-1"></i>{erreur}
          </div>
        )}
      </div>

      {/* ── Ajusteur de prix (visible quand les 2 champs sont remplis) ── */}
      {pret && (
        <div className="px-4 pb-3">
          <div className="rounded-4 p-3" style={{ background: '#1e2d3d', border: '1px solid #2d3f52' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="text-white fw-semibold small">Votre offre de tarif</div>
                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                  Prix estimé · <span style={{ color: '#00D26A' }}>{prixEstime} DH</span>
                </div>
              </div>
              <span
                className="badge"
                style={{ background: 'rgba(0,210,106,0.12)', color: '#00D26A', fontSize: '0.72rem' }}
              >
                inDrive
              </span>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <button
                type="button"
                className="btn rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px', background: '#2d3f52', color: '#fff', border: 'none', fontSize: '1.2rem' }}
                onClick={() => ajusterPrix(-5)}
              >
                <i className="bi bi-dash-lg"></i>
              </button>

              <div className="text-center">
                <div className="text-white fw-bold" style={{ fontSize: '2.4rem', lineHeight: 1 }}>{prix}</div>
                <div className="text-secondary small">DH</div>
              </div>

              <button
                type="button"
                className="btn rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '48px', height: '48px', background: '#2d3f52', color: '#fff', border: 'none', fontSize: '1.2rem' }}
                onClick={() => ajusterPrix(5)}
              >
                <i className="bi bi-plus-lg"></i>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Destinations récentes ── */}
      <div className="px-4 pb-3 flex-grow-1">
        <div className="text-secondary mb-2" style={{ fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Destinations récentes
        </div>
        <div className="rounded-4 overflow-hidden" style={{ background: '#1e2d3d', border: '1px solid #2d3f52' }}>
          {DESTINATIONS_RECENTES.map((dest, i) => (
            <div
              key={i}
              className="d-flex align-items-center gap-3 px-3"
              style={{
                paddingTop: '12px',
                paddingBottom: '12px',
                borderBottom: i < DESTINATIONS_RECENTES.length - 1 ? '1px solid #2d3f52' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => remplirChamp(dest.nom)}
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{ width: '36px', height: '36px', background: '#111827' }}
              >
                <i className={`${dest.icone} text-secondary`} style={{ fontSize: '0.9rem' }}></i>
              </div>
              <div className="text-white small fw-semibold">{dest.nom}</div>
              <i className="bi bi-arrow-right ms-auto text-secondary" style={{ fontSize: '0.8rem' }}></i>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bouton CTA fixé en bas ── */}
      <div
        className="px-4 pt-3 pb-5"
        style={{ background: 'linear-gradient(to top, #111827 80%, transparent)' }}
      >
        <button
          type="button"
          disabled={!pret}
          className="btn w-100 py-3 fw-bold rounded-3"
          style={{
            background: pret ? '#00D26A' : '#1e2d3d',
            color: pret ? '#000' : '#4b5563',
            border: 'none',
            fontSize: '1rem',
            transition: 'all 0.2s',
          }}
          onClick={handleValider}
        >
          <i className="bi bi-search me-2"></i>
          {pret ? `Trouver un chauffeur · ${prix} DH` : 'Saisissez départ et destination'}
        </button>
      </div>
    </div>
  );
}

/* ─── Étape 2 : Attente de réponse d'un chauffeur ─────────────────── */
function AttenteChauf({ course, onAnnuler }) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center px-4"
      style={{ background: '#111827', minHeight: '100vh' }}
    >
      {/* Animation de recherche */}
      <div className="position-relative mb-5" style={{ width: '140px', height: '140px' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="position-absolute top-50 start-50 translate-middle rounded-circle"
            style={{
              width: `${i * 44}px`,
              height: `${i * 44}px`,
              border: '2px solid rgba(0, 210, 106, 0.2)',
              animation: `vtc-pulse ${1 + i * 0.4}s infinite ease-out`,
            }}
          />
        ))}
        <div
          className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center shadow-lg"
          style={{ width: '56px', height: '56px', background: '#00D26A', zIndex: 10 }}
        >
          <i className="bi bi-car-front-fill text-dark fs-4"></i>
        </div>
      </div>

      <h5 className="text-white fw-bold mb-1 text-center">Recherche d'un chauffeur...</h5>
      <p className="text-secondary small text-center mb-5" style={{ maxWidth: '280px' }}>
        Votre offre de <span className="text-white fw-semibold">{course.prix} DH</span> est visible par les chauffeurs à proximité
      </p>

      {/* Résumé trajet */}
      <div className="w-100 rounded-4 p-3 mb-5" style={{ background: '#1e2d3d', border: '1px solid #2d3f52', maxWidth: '380px' }}>
        <div className="d-flex gap-3 align-items-start">
          <div className="d-flex flex-column align-items-center gap-1 pt-1">
            <i className="bi bi-circle-fill text-success" style={{ fontSize: '0.5rem' }}></i>
            <div style={{ width: '1px', height: '24px', background: '#2d3f52' }}></div>
            <i className="bi bi-geo-alt-fill text-danger" style={{ fontSize: '0.8rem' }}></i>
          </div>
          <div className="flex-grow-1">
            <div className="text-white fw-semibold small">{course.depart}</div>
            <div className="text-secondary mb-2" style={{ fontSize: '0.75rem' }}>Départ</div>
            <div className="text-white fw-semibold small">{course.destination}</div>
            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Destination</div>
          </div>
          <div className="text-end">
            <div className="text-success fw-bold fs-5">{course.prix}</div>
            <div className="text-secondary small">DH</div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn rounded-pill px-5 py-2"
        style={{ background: '#1e2d3d', color: '#9ca3af', border: '1px solid #2d3f52' }}
        onClick={onAnnuler}
      >
        <i className="bi bi-x-circle me-2"></i>Annuler la recherche
      </button>

      <style>{`
        @keyframes vtc-pulse {
          0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Étape 3 : Course en cours ───────────────────────────────────── */
function CourseEnCours({ course, chauffeur, onTerminer }) {
  const [statut, setStatut] = useState('chauffeur_en_route');

  const ETAPES = {
    chauffeur_en_route: { label: 'Chauffeur en route...', couleur: '#F59E0B', icone: 'bi-car-front' },
    arrive:             { label: 'Chauffeur arrivé !',    couleur: '#3B82F6', icone: 'bi-pin-map-fill' },
    en_cours:           { label: 'Course en cours',       couleur: '#00D26A', icone: 'bi-lightning-fill' },
  };

  const etape = ETAPES[statut];

  return (
    <div className="d-flex flex-column" style={{ background: '#111827', minHeight: '100vh' }}>

      {/* Barre de statut */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid #1e2d3d' }}>
        <div className="d-flex align-items-center gap-2">
          <i className={etape.icone} style={{ color: etape.couleur, fontSize: '1.2rem' }}></i>
          <span className="fw-bold text-white">{etape.label}</span>
        </div>
      </div>

      {/* Zone centrale */}
      <div className="flex-grow-1 d-flex flex-column align-items-center justify-content-center px-4 py-4">
        {/* Avatar chauffeur */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mb-3"
          style={{ width: '76px', height: '76px', background: '#1e2d3d', border: '3px solid #00D26A', fontSize: '1.9rem' }}
        >
          {chauffeur?.nom?.charAt(0) || 'C'}
        </div>

        <div className="text-white fw-bold fs-5 mb-0">{chauffeur?.nom || 'Chauffeur Partenaire'}</div>
        <div className="text-secondary small mb-3">{chauffeur?.vehicule || 'Toyota Corolla'}</div>

        {/* Note */}
        <div className="d-flex gap-1 mb-4 align-items-center">
          {[1, 2, 3, 4, 5].map((i) => (
            <i
              key={i}
              className={`bi ${i <= Math.round(chauffeur?.note || 4.8) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
              style={{ fontSize: '0.9rem' }}
            ></i>
          ))}
          <span className="text-secondary small ms-1">{chauffeur?.note || '4.8'}</span>
        </div>

        {/* Résumé trajet */}
        <div className="w-100 rounded-4 p-3 mb-4" style={{ background: '#1e2d3d', border: '1px solid #2d3f52', maxWidth: '360px' }}>
          <div className="d-flex gap-2 align-items-center text-secondary small mb-2">
            <i className="bi bi-geo-alt text-success"></i>
            <span>{course.depart}</span>
          </div>
          <div className="d-flex gap-2 align-items-center text-secondary small">
            <i className="bi bi-flag text-danger"></i>
            <span className="flex-grow-1">{course.destination}</span>
            <span className="text-success fw-bold">{course.prix} DH</span>
          </div>
        </div>

        {/* Indicateurs de progression */}
        <div className="d-flex gap-2">
          {Object.keys(ETAPES).map((s) => (
            <div
              key={s}
              className="rounded-pill"
              style={{
                height: '4px',
                width: statut === s ? '28px' : '10px',
                background: statut === s ? '#00D26A' : '#1e2d3d',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-5 d-flex flex-column gap-2">
        {statut !== 'en_cours' && (
          <button
            type="button"
            className="btn py-3 rounded-3 fw-semibold text-white"
            style={{ background: '#1e2d3d', border: '1px solid #2d3f52' }}
            onClick={() => setStatut(statut === 'chauffeur_en_route' ? 'arrive' : 'en_cours')}
          >
            Simuler l'étape suivante →
          </button>
        )}

        {statut === 'en_cours' && (
          <button
            type="button"
            className="btn py-3 rounded-3 fw-bold"
            style={{ background: '#00D26A', color: '#000', border: 'none' }}
            onClick={onTerminer}
          >
            <i className="bi bi-flag-fill me-2"></i>Course terminée
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Composant principal : Orchestre le parcours passager ─────────── */
function PassagerPage({ utilisateur, onDeconnexion }) {
  const [etape, setEtape] = useState('formulaire'); // formulaire | attente | course
  const [courseEnCours, setCourseEnCours] = useState(null);

  /* Chauffeur de démo (sera remplacé par API) */
  const CHAUFFEUR_DEMO = { nom: 'Karim Tazi', vehicule: 'Dacia Logan · 12345-A-1', note: 4.8 };

  /* Formulaire validé → mode attente, simulation chauffeur après 4s */
  const handleValiderCourse = (donnees) => {
    setCourseEnCours(donnees);
    setEtape('attente');
    setTimeout(() => setEtape('course'), 4000);
  };

  const handleAnnuler = () => {
    setCourseEnCours(null);
    setEtape('formulaire');
  };

  const handleTerminerCourse = () => {
    setCourseEnCours(null);
    setEtape('formulaire');
  };

  return (
    <div style={{ background: '#111827', minHeight: '100vh' }}>
      {/* Navbar dark uniquement sur la vue formulaire */}
      {etape === 'formulaire' && (
        <NavbarDark utilisateur={utilisateur} onDeconnexion={onDeconnexion} />
      )}

      {etape === 'formulaire' && (
        <FormulaireCourse utilisateur={utilisateur} onValider={handleValiderCourse} />
      )}

      {etape === 'attente' && (
        <AttenteChauf course={courseEnCours} onAnnuler={handleAnnuler} />
      )}

      {etape === 'course' && (
        <CourseEnCours course={courseEnCours} chauffeur={CHAUFFEUR_DEMO} onTerminer={handleTerminerCourse} />
      )}
    </div>
  );
}

export default PassagerPage;
