import { useState } from 'react';
import Input from './ui/Input';

// Formulaire d'authentification : Bascule entre Connexion et Inscription (Client / Chauffeur selon UML)
function AuthForm({ onLoginSuccess }) {
  // Mode actif : 'login' ou 'register'
  const [mode, setMode] = useState('login');
  // Pour l'inscription : 'client' ou 'chauffeur'
  const [role, setRole] = useState('client');

  // Champs du formulaire
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [permis, setPermis] = useState('');
  const [vehicule, setVehicule] = useState('');

  // Gestion des erreurs et chargement
  const [erreurs, setErreurs] = useState({});
  const [chargement, setChargement] = useState(false);

  // Validation légère côté client
  const valider = () => {
    const errs = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Veuillez saisir une adresse email valide.';
    }
    if (!motDePasse || motDePasse.length < 6) {
      errs.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères.';
    }

    if (mode === 'register') {
      if (!nom.trim()) errs.nom = 'Le nom complet est obligatoire.';
      if (!telephone.trim()) errs.telephone = 'Le numéro de téléphone est obligatoire.';

      if (role === 'chauffeur') {
        if (!permis.trim()) errs.permis = 'Le numéro de permis est obligatoire.';
        if (!vehicule.trim()) errs.vehicule = 'Les informations du véhicule sont obligatoires.';
      }
    }

    setErreurs(errs);
    return Object.keys(errs).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valider()) return;

    setChargement(true);
    setTimeout(() => {
      setChargement(false);
      const utilisateur = {
        email,
        nom: mode === 'register' ? nom : email.split('@')[0],
        role: mode === 'login' ? 'client' : role,
        telephone,
        permis: role === 'chauffeur' ? permis : null,
        vehicule: role === 'chauffeur' ? vehicule : null,
      };
      onLoginSuccess(utilisateur);
    }, 600);
  };

  return (
    <div className="w-100" style={{ maxWidth: '440px' }}>
      {/* En-tête de formulaire avec contraste typographique fort */}
      <div className="mb-4">
        <h2 className="fw-bold tracking-tight text-dark mb-1" style={{ fontSize: '1.75rem' }}>
          {mode === 'login' ? 'Bienvenue à bord' : 'Créer votre compte'}
        </h2>
        <p className="text-secondary small mb-0">
          {mode === 'login'
            ? 'Connectez-vous pour commander ou accepter des courses.'
            : 'Rejoignez le réseau VTC & Taxi nouvelle génération.'}
        </p>
      </div>

      {/* Sélecteur de rôle si mode Inscription */}
      {mode === 'register' && (
        <div className="p-1 bg-light rounded-3 d-flex gap-1 mb-4 border border-secondary-subtle">
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-2 fw-semibold py-2 ${
              role === 'client' ? 'bg-white shadow-sm text-dark' : 'text-secondary border-0'
            }`}
            onClick={() => setRole('client')}
          >
            <i className="bi bi-person me-1.5"></i> Passager / Client
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-2 fw-semibold py-2 ${
              role === 'chauffeur' ? 'bg-white shadow-sm text-dark' : 'text-secondary border-0'
            }`}
            onClick={() => setRole('chauffeur')}
          >
            <i className="bi bi-car-front me-1.5"></i> Chauffeur VTC
          </button>
        </div>
      )}

      {/* Formulaire interactif */}
      <form onSubmit={handleSubmit} noValidate>
        {mode === 'register' && (
          <>
            <Input
              label="Nom complet"
              id="nom"
              placeholder="Ex: Yassine Mansouri"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              error={erreurs.nom}
            />
            <Input
              label="Numéro de téléphone"
              id="telephone"
              type="tel"
              placeholder="Ex: 06 12 34 56 78"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              error={erreurs.telephone}
            />
          </>
        )}

        <Input
          label="Adresse email"
          id="email"
          type="email"
          placeholder="nom@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={erreurs.email}
        />

        <Input
          label="Mot de passe"
          id="motDePasse"
          isPassword={true}
          placeholder="••••••••"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          error={erreurs.motDePasse}
        />

        {/* Attributs spécifiques Chauffeur définis dans le Diagramme de Classes */}
        {mode === 'register' && role === 'chauffeur' && (
          <div className="p-3 bg-light rounded-3 border border-secondary-subtle mb-3">
            <div className="small fw-bold text-dark mb-2 d-flex align-items-center">
              <i className="bi bi-shield-check text-success me-1.5"></i> Profil Chauffeur Professionnel
            </div>
            <Input
              label="Numéro de permis de conduire"
              id="permis"
              placeholder="Ex: B-459201"
              value={permis}
              onChange={(e) => setPermis(e.target.value)}
              error={erreurs.permis}
            />
            <Input
              label="Véhicule (Marque, Modèle, Plaque)"
              id="vehicule"
              placeholder="Ex: Dacia Logan - 12345|A|33"
              value={vehicule}
              onChange={(e) => setVehicule(e.target.value)}
              error={erreurs.vehicule}
            />
          </div>
        )}

        {/* Bouton d'action principal styled Spring Emerald */}
        <button
          type="submit"
          className="btn btn-indrive w-100 py-2.5 rounded-3 fw-bold mt-2 d-flex align-items-center justify-content-center"
          disabled={chargement}
        >
          {chargement ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
          ) : (
            <span>{mode === 'login' ? 'Se connecter' : "Finaliser l'inscription"}</span>
          )}
        </button>
      </form>

      {/* Bascule Connexion / Inscription */}
      <div className="mt-4 pt-3 border-top border-light-subtle text-center">
        {mode === 'login' ? (
          <p className="text-secondary small mb-0">
            Vous n'avez pas encore de compte ?{' '}
            <button
              type="button"
              className="btn btn-link p-0 text-success fw-bold text-decoration-none small"
              onClick={() => {
                setMode('register');
                setErreurs({});
              }}
            >
              Créer un compte
            </button>
          </p>
        ) : (
          <p className="text-secondary small mb-0">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              className="btn btn-link p-0 text-success fw-bold text-decoration-none small"
              onClick={() => {
                setMode('login');
                setErreurs({});
              }}
            >
              Se connecter
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
