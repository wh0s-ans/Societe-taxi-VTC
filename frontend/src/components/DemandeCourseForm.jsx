import { useState } from 'react';
import Course from '../models/Course';

// Formulaire de réservation inDrive : Trajet, catégorie de véhicule et négociation de prix
function DemandeCourseForm({ onDemanderCourse }) {
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [typeVehicule, setTypeVehicule] = useState('Standard');
  const [prix, setPrix] = useState(35);
  const [nomClient, setNomClient] = useState('');
  const [telephoneClient, setTelephoneClient] = useState('');

  // Ajustement du prix avec boutons plus et moins (style inDrive)
  const modifierPrix = (delta) => {
    setPrix((ancienPrix) => Math.max(10, ancienPrix + delta));
  };

  // Recalcule une estimation automatique dès que l'utilisateur choisit un véhicule
  const choisirVehicule = (type) => {
    setTypeVehicule(type);
    const estimation = Course.estimerPrix(6, type);
    setPrix(estimation);
  };

  // Soumission de la demande de course
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

    // Réinitialisation du formulaire
    setDepart('');
    setArrivee('');
  };

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 bg-white mb-4">
      <h5 className="fw-bold mb-3 d-flex align-items-center">
        <i className="bi bi-geo-alt text-success me-2 fs-4"></i>
        Où souhaitez-vous aller ?
      </h5>

      <form onSubmit={handleSubmit}>
        {/* Champs de trajet Départ / Destination */}
        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary">Point de départ</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-success">
              <i className="bi bi-circle-fill" style={{ fontSize: '0.6rem' }}></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Ex: Centre-ville, Gare..."
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label small fw-semibold text-secondary">Destination</label>
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0 text-danger">
              <i className="bi bi-geo-alt-fill"></i>
            </span>
            <input
              type="text"
              className="form-control bg-light border-start-0"
              placeholder="Ex: Aéroport, Plage..."
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Sélection des catégories de véhicule */}
        <label className="form-label small fw-semibold text-secondary mb-2">Type de véhicule</label>
        <div className="row g-2 mb-3">
          <div className="col-4">
            <div
              className={`card-vehicule text-center p-2 ${typeVehicule === 'Standard' ? 'active' : ''}`}
              onClick={() => choisirVehicule('Standard')}
            >
              <i className="bi bi-taxi-front fs-3 text-dark"></i>
              <div className="small fw-bold">Taxi</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Standard</div>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`card-vehicule text-center p-2 ${typeVehicule === 'Confort' ? 'active' : ''}`}
              onClick={() => choisirVehicule('Confort')}
            >
              <i className="bi bi-car-front-fill fs-3 text-dark"></i>
              <div className="small fw-bold">VTC</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Confort</div>
            </div>
          </div>
          <div className="col-4">
            <div
              className={`card-vehicule text-center p-2 ${typeVehicule === 'Van' ? 'active' : ''}`}
              onClick={() => choisirVehicule('Van')}
            >
              <i className="bi bi-truck-front-fill fs-3 text-dark"></i>
              <div className="small fw-bold">Van</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Groupe</div>
            </div>
          </div>
        </div>

        {/* Négociation de prix style inDrive */}
        <div className="bg-light rounded-4 p-3 mb-3 text-center">
          <div className="small text-secondary fw-semibold mb-1">Votre proposition de tarif</div>
          <div className="d-flex align-items-center justify-content-center gap-3">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-circle"
              style={{ width: '42px', height: '42px' }}
              onClick={() => modifierPrix(-5)}
            >
              <i className="bi bi-dash-lg"></i>
            </button>
            <span className="fs-3 fw-bold text-dark">{prix} <small className="fs-6">DH</small></span>
            <button
              type="button"
              className="btn btn-outline-secondary rounded-circle"
              style={{ width: '42px', height: '42px' }}
              onClick={() => modifierPrix(5)}
            >
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>

        {/* Informations de contact du passager */}
        <div className="row g-2 mb-3">
          <div className="col-6">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Votre Nom"
              value={nomClient}
              onChange={(e) => setNomClient(e.target.value)}
            />
          </div>
          <div className="col-6">
            <input
              type="tel"
              className="form-control form-control-sm"
              placeholder="Téléphone"
              value={telephoneClient}
              onChange={(e) => setTelephoneClient(e.target.value)}
            />
          </div>
        </div>

        {/* Bouton de confirmation */}
        <button type="submit" className="btn btn-indrive w-100 py-3 fs-5 shadow-sm">
          Trouver un chauffeur
        </button>
      </form>
    </div>
  );
}

export default DemandeCourseForm;
