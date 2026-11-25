import { useState, useEffect, useCallback } from 'react';
import Course from '../models/Course';
import GestionCoursesService from '../services/GestionCoursesService';

/* Catégories de véhicules avec icônes vectorielles et délai estimé */
const TYPES_VEHICULE = [
  { id: 'Standard', label: 'Standard', icone: 'bi-car-front',   eta: '3 min', capacite: '4 places' },
  { id: 'Moto',     label: 'Moto',     icone: 'bi-bicycle',     eta: '2 min', capacite: '1 place' },
  { id: 'Confort',  label: 'Confort',  icone: 'bi-gem',         eta: '5 min', capacite: 'Berline' },
  { id: 'Van',      label: 'Van',      icone: 'bi-bus-front',   eta: '7 min', capacite: '6 places' },
];

/* Trajets fréquents avec distance estimée pour pré-remplissage rapide */
const TRAJETS_FREQUENTS = [
  { nom: 'Centre Commercial', zone: 'Centre-ville',   distance: 3.2, icone: 'bi-bag' },
  { nom: 'Gare Routière',     zone: 'Pôle transport', distance: 5.8, icone: 'bi-train-front' },
  { nom: 'Hôpital Régional',  zone: 'Secteur Santé',  distance: 7.1, icone: 'bi-hospital' },
  { nom: 'Aéroport',          zone: 'Terminal 1',     distance: 18.5, icone: 'bi-airplane' },
];

const DISTANCES_PRESETS = [2, 5, 10, 20];

/* ─── Barre de navigation supérieure (Light) ───────────────────────── */
function NavbarLight({ utilisateur, onDeconnexion }) {
  const initiales = (utilisateur?.nom || utilisateur?.username || 'P')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="passager-nav">
      <div
        className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between"
        style={{ maxWidth: '1120px', height: '58px' }}
      >
        <div className="d-flex align-items-center gap-2">
          <span
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: '#0a0f1a',
              color: '#00d26a',
              fontSize: '0.9rem',
            }}
          >
            <i className="bi bi-geo-alt-fill"></i>
          </span>
          <span className="font-display fw-bold" style={{ fontSize: '1.05rem', color: '#0a0f1a' }}>
            VTC<span style={{ color: '#059669' }}>Express</span>
          </span>
          <span
            className="d-none d-sm-inline-block font-mono-label ms-1 px-2 py-0"
            style={{
              fontSize: '0.7rem',
              color: '#475569',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              lineHeight: '20px',
            }}
          >
            Passager
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 gap-sm-3">
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center fw-semibold"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#0a0f1a',
                fontSize: '0.72rem',
              }}
            >
              {initiales}
            </span>
            <span className="d-none d-sm-inline small fw-medium" style={{ color: '#334155' }}>
              {utilisateur?.nom || utilisateur?.username}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1"
            style={{
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#475569',
              borderRadius: '8px',
              fontSize: '0.8rem',
              padding: '5px 11px',
            }}
            onClick={onDeconnexion}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span className="d-none d-sm-inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Badge de statut lisible (contraste élevé) ────────────────────── */
function StatutBadge({ statut }) {
  const styles = {
    'En attente': 'badge-status-attente',
    'Acceptée':   'badge-status-acceptee',
    'En cours':   'badge-status-cours',
    'Terminée':   'badge-status-terminee',
    'Annulée':    'badge-status-annulee',
  };
  return (
    <span className={`badge-status ${styles[statut] || 'badge-status-terminee'}`}>
      {statut}
    </span>
  );
}

/* ─── Étape 1 : Formulaire de commande & négociation ───────────────── */
function FormulaireCourse({
  utilisateur,
  coursesHistorique,
  chargementHistorique,
  onValider,
  onAnnulerHistorique,
  envoiEnCours,
}) {
  const [depart, setDepart] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(5);
  const [typeVehicule, setTypeVehicule] = useState('Standard');
  const [prixEstime, setPrixEstime] = useState(35);
  const [prixOffre, setPrixOffre] = useState(35);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  /* Récupère le tarif conseillé depuis l'API Laravel (/api/tarifs/estimer) */
  useEffect(() => {
    let actif = true;
    const calculer = async () => {
      setCalculEnCours(true);
      try {
        const res = await GestionCoursesService.estimerPrix(distance, typeVehicule);
        if (actif && res?.prix_estime !== undefined) {
          const estime = Math.round(Number(res.prix_estime));
          setPrixEstime(estime);
          setPrixOffre(estime);
        }
      } catch {
        if (actif) {
          const fallback = Course.estimerPrix(distance, typeVehicule);
          setPrixEstime(fallback);
          setPrixOffre(fallback);
        }
      } finally {
        if (actif) setCalculEnCours(false);
      }
    };
    calculer();
    return () => { actif = false; };
  }, [distance, typeVehicule]);

  const inverserTrajet = () => {
    setDepart(destination);
    setDestination(depart);
  };

  const remplirDestination = (item) => {
    if (!depart.trim()) {
      setDepart(item.nom);
    } else {
      setDestination(item.nom);
      setDistance(item.distance);
    }
    setErreur('');
  };

  const ajusterPrix = (delta) => {
    setPrixOffre((p) => Math.max(10, p + delta));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!depart.trim() || !destination.trim()) {
      setErreur('Indiquez un point de départ et une destination pour continuer.');
      return;
    }
    setErreur('');
    onValider({
      depart: depart.trim(),
      destination: destination.trim(),
      distance,
      typeVehicule,
      prix: prixOffre,
    });
  };

  const ecartPrix = prixOffre - prixEstime;
  const pret = depart.trim().length > 0 && destination.trim().length > 0;
  const prenom = utilisateur?.nom?.split(' ')[0] || utilisateur?.username || 'Passager';

  return (
    <div className="container-fluid px-3 px-lg-4 py-4 passager-animate-in" style={{ maxWidth: '1120px' }}>
      <div className="row g-4 align-items-start">

        {/* Colonne Principale : Saisie trajet & négociation */}
        <div className="col-12 col-lg-7">
          <div className="mb-3">
            <h1 className="font-display fw-bold mb-1" style={{ fontSize: '1.55rem', color: '#0a0f1a' }}>
              Commander un trajet, {prenom}
            </h1>
            <p className="mb-0 small" style={{ color: '#525e70' }}>
              Saisissez votre itinéraire, consultez l'estimation du tarif et proposez votre prix.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="passager-panel p-3 p-sm-4">
            {/* 1. Itinéraire (Départ + Destination avec rail vertical) */}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <label className="small fw-semibold" style={{ color: '#0a0f1a' }}>Itinéraire</label>
              <button
                type="button"
                className="passager-swap-btn"
                onClick={inverserTrajet}
                title="Inverser départ et destination"
              >
                <i className="bi bi-arrow-down-up" style={{ fontSize: '0.78rem' }}></i>
              </button>
            </div>

            <div className="passager-route-box mb-3">
              {/* Départ */}
              <div className="d-flex align-items-center px-3 py-2 gap-3" style={{ minHeight: '48px' }}>
                <span
                  className="flex-shrink-0"
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: '#00c864',
                    boxShadow: '0 0 0 3px rgba(0, 200, 100, 0.16)',
                  }}
                />
                <input
                  type="text"
                  className="bg-transparent border-0 w-100"
                  placeholder="Point de départ (ex: Gare Routière)"
                  value={depart}
                  onChange={(e) => { setDepart(e.target.value); setErreur(''); }}
                  style={{ outline: 'none', fontSize: '0.92rem', color: '#0a0f1a' }}
                />
                {depart && (
                  <button
                    type="button"
                    className="btn btn-sm p-0 border-0 text-secondary"
                    onClick={() => setDepart('')}
                    aria-label="Effacer le départ"
                  >
                    <i className="bi bi-x-lg" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                )}
              </div>

              <div style={{ height: '1px', background: '#f1f5f9', marginLeft: '40px' }} />

              {/* Destination */}
              <div className="d-flex align-items-center px-3 py-2 gap-3" style={{ minHeight: '48px' }}>
                <span
                  className="flex-shrink-0"
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '2px',
                    background: '#0a0f1a',
                  }}
                />
                <input
                  type="text"
                  className="bg-transparent border-0 w-100"
                  placeholder="Destination (ex: Centre Commercial)"
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setErreur(''); }}
                  style={{ outline: 'none', fontSize: '0.92rem', color: '#0a0f1a' }}
                />
                {destination && (
                  <button
                    type="button"
                    className="btn btn-sm p-0 border-0 text-secondary"
                    onClick={() => setDestination('')}
                    aria-label="Effacer la destination"
                  >
                    <i className="bi bi-x-lg" style={{ fontSize: '0.75rem' }}></i>
                  </button>
                )}
              </div>
            </div>

            {/* Distance estimée interactive (sans carte) */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-signpost-split text-secondary" style={{ fontSize: '0.85rem' }}></i>
                <span className="small" style={{ color: '#525e70' }}>Distance estimée</span>
                <span className="font-mono-label fw-semibold small px-2 py-0" style={{ background: '#f1f5f9', borderRadius: '6px', color: '#0a0f1a' }}>
                  {distance} km
                </span>
              </div>
              <div className="d-flex gap-1">
                {DISTANCES_PRESETS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setDistance(km)}
                    className="btn btn-sm font-mono-label"
                    style={{
                      fontSize: '0.74rem',
                      padding: '3px 9px',
                      borderRadius: '6px',
                      border: distance === km ? '1px solid #0a0f1a' : '1px solid #e2e8f0',
                      background: distance === km ? '#0a0f1a' : '#ffffff',
                      color: distance === km ? '#ffffff' : '#525e70',
                    }}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Sélecteur de véhicule */}
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label className="small fw-semibold" style={{ color: '#0a0f1a' }}>Mode de transport</label>
                <span className="small" style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  {TYPES_VEHICULE.find((t) => t.id === typeVehicule)?.capacite}
                </span>
              </div>

              <div className="row g-2">
                {TYPES_VEHICULE.map((type) => {
                  const actif = typeVehicule === type.id;
                  return (
                    <div key={type.id} className="col-6 col-sm-3">
                      <button
                        type="button"
                        onClick={() => setTypeVehicule(type.id)}
                        className={`passager-veh-btn w-100 p-2 text-start d-flex flex-column justify-content-between ${actif ? 'is-active' : ''}`}
                        style={{ minHeight: '82px' }}
                      >
                        <div className="d-flex align-items-center justify-content-between w-100">
                          <i className={`bi ${type.icone}`} style={{ fontSize: '1.15rem', color: actif ? '#00d26a' : '#0a0f1a' }}></i>
                          <span className="font-mono-label" style={{ fontSize: '0.68rem', opacity: actif ? 0.85 : 0.65 }}>
                            {type.eta}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="fw-semibold" style={{ fontSize: '0.84rem' }}>{type.label}</div>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Négociation du tarif (calculé par le backend) */}
            <div
              className="p-3 mb-4"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <div className="small fw-semibold" style={{ color: '#0a0f1a' }}>Votre offre de tarif</div>
                  <div className="small" style={{ color: '#525e70', fontSize: '0.78rem' }}>
                    Tarif de base serveur :{' '}
                    <span className="font-mono-label fw-semibold" style={{ color: '#0a0f1a' }}>
                      {calculEnCours ? '...' : `${prixEstime} DH`}
                    </span>
                  </div>
                </div>

                <span
                  className="font-mono-label px-2 py-1"
                  style={{
                    fontSize: '0.72rem',
                    borderRadius: '6px',
                    background: ecartPrix >= 0 ? 'rgba(0, 200, 100, 0.12)' : '#fef3c7',
                    color: ecartPrix >= 0 ? '#047857' : '#92400e',
                    fontWeight: 600,
                  }}
                >
                  {ecartPrix === 0
                    ? 'Tarif conseillé'
                    : ecartPrix > 0
                      ? `+${ecartPrix} DH · Prioritaire`
                      : `${ecartPrix} DH · Négocié`}
                </span>
              </div>

              <div className="d-flex align-items-center justify-content-between">
                <button
                  type="button"
                  className="passager-stepper-btn"
                  onClick={() => ajusterPrix(-5)}
                  disabled={prixOffre <= 10}
                  aria-label="Diminuer le tarif de 5 DH"
                >
                  <i className="bi bi-dash-lg"></i>
                </button>

                <div className="text-center">
                  <span className="font-display fw-bold tabular-nums" style={{ fontSize: '2.25rem', color: '#0a0f1a', lineHeight: 1 }}>
                    {prixOffre}
                  </span>
                  <span className="font-mono-label ms-1 fw-semibold" style={{ fontSize: '0.9rem', color: '#525e70' }}>
                    DH
                  </span>
                </div>

                <button
                  type="button"
                  className="passager-stepper-btn"
                  onClick={() => ajusterPrix(5)}
                  aria-label="Augmenter le tarif de 5 DH"
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>

            {erreur && (
              <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2" style={{ borderRadius: '10px' }}>
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{erreur}</span>
              </div>
            )}

            {/* Bouton principal */}
            <button
              type="submit"
              disabled={!pret || envoiEnCours}
              className="passager-cta w-100 py-3 d-flex align-items-center justify-content-center gap-2"
            >
              {envoiEnCours ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  <span>Publication de la demande...</span>
                </>
              ) : (
                <>
                  <span>{pret ? `Trouver un chauffeur · ${prixOffre} DH` : 'Renseignez votre trajet'}</span>
                  {pret && <i className="bi bi-arrow-right"></i>}
                </>
              )}
            </button>
          </form>

          {/* Suggestions rapides */}
          <div className="mt-3 passager-panel overflow-hidden">
            <div className="px-3 py-2 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <span className="small fw-semibold" style={{ color: '#475569', fontSize: '0.78rem' }}>
                Destinations fréquentes
              </span>
              <span className="small" style={{ color: '#94a3b8', fontSize: '0.74rem' }}>
                Cliquer pour remplir
              </span>
            </div>
            {TRAJETS_FREQUENTS.map((item, idx) => (
              <div
                key={item.nom}
                className="passager-quick-row d-flex align-items-center gap-3 px-3 py-2"
                style={{ borderBottom: idx < TRAJETS_FREQUENTS.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                onClick={() => remplirDestination(item)}
              >
                <span
                  className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', color: '#0a0f1a' }}
                >
                  <i className={`bi ${item.icone}`} style={{ fontSize: '0.85rem' }}></i>
                </span>
                <div className="flex-grow-1 min-w-0">
                  <div className="fw-medium small text-truncate" style={{ color: '#0a0f1a' }}>{item.nom}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{item.zone}</div>
                </div>
                <span className="font-mono-label small" style={{ color: '#475569', fontSize: '0.75rem' }}>
                  {item.distance} km
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Secondaire : Historique & courses actives (API Laravel) */}
        <div className="col-12 col-lg-5">
          <div className="passager-panel overflow-hidden">
            <div className="px-3 py-3 d-flex align-items-center justify-content-between" style={{ borderBottom: '1px solid #e5e7eb' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-clock-history" style={{ color: '#0a0f1a' }}></i>
                <h2 className="font-display fw-semibold mb-0" style={{ fontSize: '0.98rem', color: '#0a0f1a' }}>
                  Mes courses
                </h2>
              </div>
              <span className="font-mono-label small px-2 py-0" style={{ background: '#f1f5f9', borderRadius: '6px', color: '#475569', fontSize: '0.74rem' }}>
                {coursesHistorique.length}
              </span>
            </div>

            {chargementHistorique ? (
              <div className="p-4 text-center small" style={{ color: '#64748b' }}>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Chargement de vos trajets...
              </div>
            ) : coursesHistorique.length === 0 ? (
              <div className="p-4 text-center">
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-2"
                  style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', color: '#64748b' }}
                >
                  <i className="bi bi-compass"></i>
                </div>
                <div className="small fw-medium" style={{ color: '#0a0f1a' }}>Aucune course enregistrée</div>
                <div className="small mt-1" style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  Vos demandes et trajets terminés apparaîtront ici.
                </div>
              </div>
            ) : (
              <div>
                {coursesHistorique.slice(0, 6).map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-3"
                    style={{ borderBottom: idx < Math.min(coursesHistorique.length, 6) - 1 ? '1px solid #f1f5f9' : 'none' }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <StatutBadge statut={c.statut} />
                      <span className="font-display fw-bold tabular-nums" style={{ color: '#0a0f1a', fontSize: '0.95rem' }}>
                        {c.prix} DH
                      </span>
                    </div>

                    <div className="small mb-1" style={{ color: '#0a0f1a' }}>
                      <span style={{ color: '#059669' }} className="me-1">●</span>
                      {c.depart}
                    </div>
                    <div className="small mb-2" style={{ color: '#475569' }}>
                      <span style={{ color: '#0a0f1a' }} className="me-1">■</span>
                      {c.arrivee}
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                      <span className="font-mono-label" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {c.type_vehicule || c.typeVehicule || 'Standard'} · {c.distance} km
                      </span>
                      {c.statut === 'En attente' && (
                        <button
                          type="button"
                          className="btn btn-sm p-0 border-0 text-danger small fw-medium"
                          style={{ fontSize: '0.76rem' }}
                          onClick={() => onAnnulerHistorique(c.id)}
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Étape 2 : Attente de réponse d'un chauffeur (Light) ──────────── */
function AttenteChauf({ course, onAjusterOffre, onAnnuler, onSimulerAcceptation }) {
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSecondes((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const chrono = `${String(Math.floor(secondes / 60)).padStart(2, '0')}:${String(secondes % 60).padStart(2, '0')}`;

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center px-3 py-5 passager-animate-in"
      style={{ minHeight: 'calc(100vh - 58px)' }}
    >
      <div className="passager-panel p-4 p-sm-5 w-100 text-center" style={{ maxWidth: '460px' }}>
        {/* Radar épuré */}
        <div className="position-relative mx-auto mb-4" style={{ width: '112px', height: '112px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="position-absolute top-50 start-50 rounded-circle"
              style={{
                width: `${i * 36}px`,
                height: `${i * 36}px`,
                border: '1.5px solid rgba(0, 200, 100, 0.32)',
                animation: `passager-radar ${1.2 + i * 0.35}s infinite cubic-bezier(0.22, 1, 0.36, 1)`,
              }}
            />
          ))}
          <div
            className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: '48px', height: '48px', background: '#0a0f1a', color: '#00d26a', zIndex: 2 }}
          >
            <i className="bi bi-broadcast fs-5"></i>
          </div>
        </div>

        <div className="font-mono-label small mb-1" style={{ color: '#059669', fontWeight: 600 }}>
          EN ATTENTE DE RÉPONSE · {chrono}
        </div>
        <h2 className="font-display fw-bold mb-2" style={{ fontSize: '1.35rem', color: '#0a0f1a' }}>
          Diffusion aux chauffeurs proches
        </h2>
        <p className="small mb-4" style={{ color: '#525e70' }}>
          Votre proposition de <strong className="tabular-nums" style={{ color: '#0a0f1a' }}>{course.prix} DH</strong> est visible par les chauffeurs disponibles.
        </p>

        {/* Résumé trajet */}
        <div className="text-start p-3 mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="min-w-0">
              <div className="small fw-semibold text-truncate" style={{ color: '#0a0f1a' }}>
                <span style={{ color: '#059669' }} className="me-2">●</span>{course.depart}
              </div>
              <div className="small fw-semibold text-truncate mt-2" style={{ color: '#0a0f1a' }}>
                <span className="me-2">■</span>{course.destination || course.arrivee}
              </div>
            </div>
            <div className="text-end flex-shrink-0">
              <div className="font-display fw-bold tabular-nums" style={{ fontSize: '1.25rem', color: '#0a0f1a' }}>
                {course.prix} DH
              </div>
              <div className="font-mono-label" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {course.typeVehicule || course.type_vehicule || 'Standard'}
              </div>
            </div>
          </div>
        </div>

        {/* Ajustement rapide pendant l'attente */}
        <div className="d-flex gap-2 mb-3">
          <button
            type="button"
            className="btn flex-grow-1 py-2 fw-semibold small"
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0a0f1a', borderRadius: '9px' }}
            onClick={() => onAjusterOffre(5)}
          >
            <i className="bi bi-plus-lg me-1"></i> Augmenter l'offre (+5 DH)
          </button>
          <button
            type="button"
            className="btn py-2 px-3 small fw-medium"
            style={{ background: '#ffffff', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '9px' }}
            onClick={onAnnuler}
          >
            Annuler
          </button>
        </div>

        <button
          type="button"
          className="btn btn-link btn-sm text-decoration-none p-0"
          style={{ color: '#64748b', fontSize: '0.78rem' }}
          onClick={onSimulerAcceptation}
        >
          Simuler l'acceptation d'un chauffeur →
        </button>
      </div>
    </div>
  );
}

/* ─── Étape 3 : Chauffeur assigné & course en cours (Light) ─────────── */
function CourseEnCours({ course, chauffeur, onTerminer }) {
  const [statut, setStatut] = useState('chauffeur_en_route');

  const ETAPES = {
    chauffeur_en_route: { label: 'Chauffeur en route',  sousTitre: 'Arrivée estimée dans 3 min', badge: 'badge-status-acceptee' },
    arrive:             { label: 'Chauffeur arrivé',    sousTitre: 'Votre chauffeur vous attend au point de départ', badge: 'badge-status-attente' },
    en_cours:           { label: 'Course en cours',     sousTitre: 'Trajet vers votre destination', badge: 'badge-status-cours' },
  };

  const etape = ETAPES[statut];
  const cles = Object.keys(ETAPES);
  const indexActuel = cles.indexOf(statut);

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center px-3 py-5 passager-animate-in"
      style={{ minHeight: 'calc(100vh - 58px)' }}
    >
      <div className="passager-panel p-4 w-100" style={{ maxWidth: '460px' }}>
        {/* En-tête statut */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <span className={`badge-status ${etape.badge}`}>{etape.label}</span>
          <span className="font-mono-label small" style={{ color: '#64748b' }}>
            #{course.id || 'LIVE'}
          </span>
        </div>

        <h2 className="font-display fw-bold mb-1" style={{ fontSize: '1.25rem', color: '#0a0f1a' }}>
          {etape.sousTitre}
        </h2>

        {/* Barre de progression 3 étapes */}
        <div className="d-flex gap-2 my-3">
          {cles.map((s, idx) => (
            <div
              key={s}
              className="flex-grow-1"
              style={{
                height: '4px',
                borderRadius: '99px',
                background: idx <= indexActuel ? '#00c864' : '#e2e8f0',
                transition: 'background-color 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Carte Chauffeur */}
        <div
          className="p-3 mb-3 d-flex align-items-center gap-3"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}
        >
          <div
            className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#0a0f1a',
              color: '#00d26a',
              fontSize: '1.2rem',
            }}
          >
            {chauffeur?.nom?.charAt(0) || 'C'}
          </div>
          <div className="flex-grow-1 min-w-0">
            <div className="fw-bold small" style={{ color: '#0a0f1a' }}>
              {chauffeur?.nom || 'Karim Tazi'}
            </div>
            <div className="font-mono-label text-truncate" style={{ fontSize: '0.75rem', color: '#525e70' }}>
              {chauffeur?.vehicule || 'Dacia Logan · 12345-A-1'}
            </div>
          </div>
          <div className="text-end flex-shrink-0">
            <div className="small fw-semibold" style={{ color: '#0a0f1a' }}>
              <i className="bi bi-star-fill text-warning me-1" style={{ fontSize: '0.8rem' }}></i>
              {chauffeur?.note || '4.9'}
            </div>
          </div>
        </div>

        {/* Détails trajet */}
        <div className="p-3 mb-4" style={{ border: '1px solid #e5e7eb', borderRadius: '12px' }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small" style={{ color: '#525e70' }}>Trajet convenu</span>
            <span className="font-display fw-bold tabular-nums" style={{ color: '#0a0f1a' }}>{course.prix} DH</span>
          </div>
          <div className="small mb-1" style={{ color: '#0a0f1a' }}>
            <span style={{ color: '#059669' }} className="me-2">●</span>{course.depart}
          </div>
          <div className="small" style={{ color: '#475569' }}>
            <span style={{ color: '#0a0f1a' }} className="me-2">■</span>{course.destination || course.arrivee}
          </div>
        </div>

        {/* Contrôles */}
        {statut !== 'en_cours' ? (
          <button
            type="button"
            className="btn w-100 py-2.5 fw-semibold"
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#0a0f1a', borderRadius: '10px' }}
            onClick={() => setStatut(statut === 'chauffeur_en_route' ? 'arrive' : 'en_cours')}
          >
            Passer à l'étape suivante →
          </button>
        ) : (
          <button
            type="button"
            className="passager-cta w-100 py-3"
            onClick={onTerminer}
          >
            <i className="bi bi-check2-circle me-2"></i>Terminer la course
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Composant principal : Orchestre le parcours passager ─────────── */
function PassagerPage({ utilisateur, onDeconnexion }) {
  const [etape, setEtape] = useState('formulaire'); // formulaire | attente | course
  const [courseActive, setCourseActive] = useState(null);
  const [chauffeurAssigne, setChauffeurAssigne] = useState({
    nom: 'Karim Tazi',
    vehicule: 'Dacia Logan · 12345-A-1',
    note: 4.9,
  });
  const [coursesHistorique, setCoursesHistorique] = useState([]);
  const [chargementHistorique, setChargementHistorique] = useState(true);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  /* Charge les courses réelles de l'utilisateur depuis Laravel */
  const chargerHistorique = useCallback(async () => {
    try {
      const data = await GestionCoursesService.getToutesCourses();
      setCoursesHistorique(Array.isArray(data) ? data : []);
    } catch {
      setCoursesHistorique([]);
    } finally {
      setChargementHistorique(false);
    }
  }, []);

  useEffect(() => {
    chargerHistorique();
  }, [chargerHistorique]);

  /* Polling toutes les 3s pendant l'attente pour détecter l'acceptation réelle par un chauffeur */
  useEffect(() => {
    if (etape !== 'attente' || !courseActive?.id) return undefined;

    const interval = setInterval(async () => {
      try {
        const maj = await GestionCoursesService.getCourseParId(courseActive.id);
        if (maj?.statut === 'Acceptée' || maj?.statut === 'En cours') {
          if (maj.chauffeur) {
            setChauffeurAssigne({
              nom: maj.chauffeur.name || maj.chauffeur.nom || 'Chauffeur Partenaire',
              vehicule: maj.chauffeur.vehicule || 'Véhicule VTC',
              note: 4.9,
            });
          }
          setCourseActive(maj);
          setEtape('course');
        }
      } catch {
        // Silencieux si hors ligne
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [etape, courseActive?.id]);

  /* Création de la course via API Laravel + bascule en attente */
  const handleValiderCourse = async (donnees) => {
    setEnvoiEnCours(true);
    try {
      const creee = await GestionCoursesService.ajouterCourse({
        depart: donnees.depart,
        arrivee: donnees.destination,
        distance: donnees.distance,
        prix: donnees.prix,
        typeVehicule: donnees.typeVehicule,
      });
      setCourseActive(creee);
      chargerHistorique();
    } catch {
      // Fallback local si le backend est inaccessible
      setCourseActive({ ...donnees, arrivee: donnees.destination, id: null });
    } finally {
      setEnvoiEnCours(false);
      setEtape('attente');
    }
  };

  /* Négociation de prix pendant la phase d'attente */
  const handleAjusterOffre = async (delta) => {
    if (!courseActive) return;
    const nouveauPrix = Math.max(10, Number(courseActive.prix) + delta);
    setCourseActive((prev) => ({ ...prev, prix: nouveauPrix }));

    if (courseActive.id) {
      try {
        await GestionCoursesService.modifierCourse(courseActive.id, { prix: nouveauPrix });
        chargerHistorique();
      } catch {
        // Garde la valeur locale si échec réseau
      }
    }
  };

  /* Annulation de la course active */
  const handleAnnuler = async () => {
    if (courseActive?.id) {
      try {
        await GestionCoursesService.changerStatutCourse(courseActive.id, 'Annulée');
      } catch {
        // Ignore si déjà annulée ou hors ligne
      }
    }
    setCourseActive(null);
    setEtape('formulaire');
    chargerHistorique();
  };

  /* Annulation depuis la liste d'historique */
  const handleAnnulerHistorique = async (id) => {
    try {
      await GestionCoursesService.changerStatutCourse(id, 'Annulée');
      chargerHistorique();
    } catch {
      // Ignore si erreur
    }
  };

  const handleTerminerCourse = () => {
    setCourseActive(null);
    setEtape('formulaire');
    chargerHistorique();
  };

  return (
    <div className="passager-shell">
      <NavbarLight utilisateur={utilisateur} onDeconnexion={onDeconnexion} />

      {etape === 'formulaire' && (
        <FormulaireCourse
          utilisateur={utilisateur}
          coursesHistorique={coursesHistorique}
          chargementHistorique={chargementHistorique}
          onValider={handleValiderCourse}
          onAnnulerHistorique={handleAnnulerHistorique}
          envoiEnCours={envoiEnCours}
        />
      )}

      {etape === 'attente' && courseActive && (
        <AttenteChauf
          course={courseActive}
          onAjusterOffre={handleAjusterOffre}
          onAnnuler={handleAnnuler}
          onSimulerAcceptation={() => setEtape('course')}
        />
      )}

      {etape === 'course' && courseActive && (
        <CourseEnCours
          course={courseActive}
          chauffeur={chauffeurAssigne}
          onTerminer={handleTerminerCourse}
        />
      )}
    </div>
  );
}

export default PassagerPage;
