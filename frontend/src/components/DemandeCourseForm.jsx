import { useState } from 'react';
import Course from '../models/Course';

// Formulaire de réservation interactif, ergonomique et soigné
function DemandeCourseForm({ onDemanderCourse }) {
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [typeVehicule, setTypeVehicule] = useState('Standard');
  const [prix, setPrix] = useState(35);
  const [nomClient, setNomClient] = useState('');
  const [telephoneClient, setTelephoneClient] = useState('');

  // Ajustement fin du prix proposé
  const modifierPrix = (delta) => {
    setPrix((prev) => Math.max(10, prev + delta));
  };

  const choisirVehicule = (type) => {
    setTypeVehicule(type);
    const estimation = Course.estimerPrix(6, type);
    setPrix(estimation);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!depart.trim() || !arrivee.trim()) return;

    onDemanderCourse({
      depart,
      arrivee,
      distance: 6,
      prix,
      typeVehicule,
      nomClient: nomClient.trim() || 'Passager',
      telephoneClient: telephoneClient.trim() || '0600000000',
    });

    setDepart('');
    setArrivee('');
  };

  return (
    <div className="ui-card p-4 mb-4">
      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
        <h2 className="fs-5 fw-bold mb-0 font-display">Commander un trajet</h2>
        <span className="text-muted small">Agadir & Régions</span>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Champs de trajet stylisés avec repères visuels */}
        <div className="mb-3">
          <label className="form-label text-secondary fw-semibold small mb-1">Point de prise en charge</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-success">
              <span className="route-dot bg-success"></span>
            </span>
            <input
              type="text"
              className="form-control form-control-custom border-start-0"
              placeholder="Ex: Marina Agadir, Talborjt..."
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-secondary fw-semibold small mb-1">Destination finale</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-danger">
              <span className="route-dot bg-danger"></span>
            </span>
            <input
              type="text"
              className="form-control form-control-custom border-start-0"
              placeholder="Ex: Aéroport Al Massira, Taghazout..."
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Sélection des catégories de véhicules */}
        <div className="mb-3">
          <label className="form-label text-secondary fw-semibold small mb-2">Catégorie de véhicule</label>
          <div className="row g-2">
            {[
              { id: 'Standard', label: 'Taxi', sub: 'Éco 1-4', icon: 'bi-taxi-front' },
              { id: 'Confort', label: 'VTC Berline', sub: 'Confort +', icon: 'bi-car-front-fill' },
              { id: 'Van', label: 'Van Groupe', sub: 'Jusqu\'à 7', icon: 'bi-truck-front-fill' },
            ].map((v) => (
              <div key={v.id} className="col-4">
                <div
                  className={`card-vehicule text-center p-2.5 ${typeVehicule === v.id ? 'active' : ''}`}
                  onClick={() => choisirVehicule(v.id)}
                  role="button"
                >
                  <i className={`bi ${v.icon} fs-4 mb-1 d-block text-dark`}></i>
                  <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{v.label}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>{v.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloc Tarif & Négociation */}
        <div className="price-box p-3 mb-3 text-center">
          <div className="text-secondary small fw-medium mb-1">Votre offre de prix</div>
          <div className="d-flex align-items-center justify-content-center gap-3">
            <button
              type="button"
              className="btn-price-adjust"
              aria-label="Diminuer le prix"
              onClick={() => modifierPrix(-5)}
            >
              <i className="bi bi-dash-lg"></i>
            </button>
            <div className="font-display">
              <span className="fs-2 fw-bold text-dark">{prix}</span>{' '}
              <span className="text-muted fw-semibold small">MAD</span>
            </div>
            <button
              type="button"
              className="btn-price-adjust"
              aria-label="Augmenter le prix"
              onClick={() => modifierPrix(5)}
            >
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>

        {/* Coordonnées Passager */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <input
              type="text"
              className="form-control form-control-custom"
              placeholder="Votre Nom"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
            />
          </div>
          <div className="col-6">
            <input
              type="tel"
              className="form-control form-control-custom"
              placeholder="Numéro Mobile"
              value={telephoneClient}
              onChange={(e) => setTelephoneClient(e.target.value)}
            />
          </div>
        </div>

        {/* Bouton d'action principal */}
        <button type="submit" className="btn-brand-primary w-100 d-flex align-items-center justify-content-center gap-2">
          <span>Trouver un chauffeur</span>
          <i className="bi bi-arrow-right"></i>
        </button>
      </form>
    </div>
  );
}

export default DemandeCourseForm;
