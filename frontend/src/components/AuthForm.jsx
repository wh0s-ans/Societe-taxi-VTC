import { useState } from 'react';
import Input from './ui/Input';
import AuthService from '../services/AuthService';

// Formulaire d'authentification — connexion username/password ou inscription Passager/Chauffeur
function AuthForm({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('client');

  const [username,   setUsername]   = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [nom,        setNom]        = useState('');
  const [telephone,  setTelephone]  = useState('');
  const [email,      setEmail]      = useState('');
  const [permis,     setPermis]     = useState('');
  const [vehicule,   setVehicule]   = useState('');

  const [erreur,      setErreur]      = useState('');
  const [chargement,  setChargement]  = useState(false);

  /* Soumission : appel réel à l'API Laravel */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    /* Validation côté client */
    if (mode === 'login') {
      if (!username.trim() || !motDePasse) {
        setErreur("Veuillez saisir votre nom d'utilisateur et votre mot de passe.");
        return;
      }
    } else {
      if (!nom.trim() || !username.trim() || !telephone.trim() || !motDePasse) {
        setErreur('Veuillez remplir tous les champs obligatoires.');
        return;
      }
      if (role === 'chauffeur' && (!permis.trim() || !vehicule.trim())) {
        setErreur('Veuillez renseigner le permis et le véhicule pour le chauffeur.');
        return;
      }
    }

    setChargement(true);
    try {
      let utilisateur;

      if (mode === 'login') {
        utilisateur = await AuthService.login(username, motDePasse);
      } else {
        utilisateur = await AuthService.register({
          name:      nom,
          username,
          email:     email || `${username}@vtcexpress.local`,
          password:  motDePasse,
          telephone,
          role,
          permis:   role === 'chauffeur' ? permis   : undefined,
          vehicule: role === 'chauffeur' ? vehicule : undefined,
        });
      }

      onLoginSuccess(utilisateur);
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue. Vérifiez votre connexion.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="w-100" style={{ maxWidth: '420px' }}>
      {/* En-tête du formulaire */}
      <div className="mb-4">
        <h2 className="fw-bold tracking-tight text-dark mb-1" style={{ fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
          {mode === 'login' ? 'Connexion' : 'Créer votre compte'}
        </h2>
        <p className="text-secondary small mb-0">
          {mode === 'login'
            ? 'Accédez à votre espace pour commander ou accepter des courses.'
            : 'Rejoignez le réseau VTC & Taxi nouvelle génération.'}
        </p>
      </div>

      {erreur && (
        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          <span>{erreur}</span>
        </div>
      )}

      {/* Sélecteur de rôle en mode Inscription */}
      {mode === 'register' && (
        <div className="p-1 bg-light rounded-3 d-flex gap-1 mb-3 border border-secondary-subtle">
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-2 fw-semibold py-2 transition-all ${
              role === 'client' ? 'bg-white shadow-sm text-dark' : 'text-secondary border-0'
            }`}
            onClick={() => setRole('client')}
          >
            <i className="bi bi-person me-1"></i> Passager / Client
          </button>
          <button
            type="button"
            className={`btn btn-sm w-50 rounded-2 fw-semibold py-2 transition-all ${
              role === 'chauffeur' ? 'bg-white shadow-sm text-dark' : 'text-secondary border-0'
            }`}
            onClick={() => setRole('chauffeur')}
          >
            <i className="bi bi-car-front me-1"></i> Chauffeur VTC
          </button>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} noValidate>
        {mode === 'login' ? (
          <>
            {/* Connexion : Username et Mot de passe uniquement */}
            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">Nom d'utilisateur</label>
              <input
                type="text"
                className="form-control py-2.5 px-3 rounded-3 bg-light border border-secondary-subtle"
                placeholder="Ex: yassine.m"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold text-secondary mb-1">Mot de passe</label>
              <Input
                id="login_password"
                isPassword={true}
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </>
        ) : (
          <>
            {/* Inscription : Champs complets */}
            <div className="row g-2 mb-2">
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold text-secondary mb-1">Nom complet</label>
                <input
                  type="text"
                  className="form-control py-2.5 px-3 rounded-3 bg-light border border-secondary-subtle"
                  placeholder="Ex: Yassine Mansouri"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
              <div className="col-12 col-sm-6">
                <label className="form-label small fw-semibold text-secondary mb-1">Nom d'utilisateur</label>
                <input
                  type="text"
                  className="form-control py-2.5 px-3 rounded-3 bg-light border border-secondary-subtle"
                  placeholder="Ex: yassine.m"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary mb-1">Numéro de téléphone</label>
              <input
                type="tel"
                className="form-control py-2.5 px-3 rounded-3 bg-light border border-secondary-subtle"
                placeholder="06 12 34 56 78"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary mb-1">Adresse email (optionnel)</label>
              <input
                type="email"
                className="form-control py-2.5 px-3 rounded-3 bg-light border border-secondary-subtle"
                placeholder="nom@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-secondary mb-1">Mot de passe</label>
              <Input
                id="register_password"
                isPassword={true}
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
              />
            </div>

            {role === 'chauffeur' && (
              <div className="p-3 bg-light rounded-3 border border-secondary-subtle mb-3">
                <div className="small fw-bold text-dark mb-2 d-flex align-items-center">
                  <i className="bi bi-shield-check text-success me-1.5"></i> Profil Chauffeur Professionnel
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold text-secondary mb-1">Numéro de permis</label>
                  <input
                    type="text"
                    className="form-control py-2 px-3 rounded-3 bg-white border border-secondary-subtle"
                    placeholder="Ex: B-459201"
                    value={permis}
                    onChange={(e) => setPermis(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label small fw-semibold text-secondary mb-1">Véhicule (Marque, Immatriculation)</label>
                  <input
                    type="text"
                    className="form-control py-2 px-3 rounded-3 bg-white border border-secondary-subtle"
                    placeholder="Ex: Toyota Corolla - 12345|A|33"
                    value={vehicule}
                    onChange={(e) => setVehicule(e.target.value)}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Bouton d'action principal Vert inDrive */}
        <button
          type="submit"
          className="btn btn-indrive w-100 py-3 rounded-3 fw-bold mt-3 shadow-sm d-flex align-items-center justify-content-center"
          disabled={chargement}
        >
          {chargement ? (
            <span className="spinner-border spinner-border-sm me-2"></span>
          ) : (
            <span>{mode === 'login' ? 'Se connecter' : "Finaliser l'inscription"}</span>
          )}
        </button>
      </form>

      {/* Séparateur et bouton bascule Connexion / Inscription */}
      <div className="mt-4 pt-3 border-top border-secondary-subtle text-center">
        {mode === 'login' ? (
          <div>
            <span className="text-secondary small d-block mb-2">Vous n'avez pas encore de compte ?</span>
            <button
              type="button"
              className="btn btn-light w-100 py-2.5 rounded-3 fw-semibold text-dark border border-secondary-subtle"
              onClick={() => {
                setMode('register');
                setErreur('');
              }}
            >
              <i className="bi bi-person-plus me-1.5"></i> Créer un compte
            </button>
          </div>
        ) : (
          <div>
            <span className="text-secondary small d-block mb-2">Vous avez déjà un compte ?</span>
            <button
              type="button"
              className="btn btn-light w-100 py-2.5 rounded-3 fw-semibold text-dark border border-secondary-subtle"
              onClick={() => {
                setMode('login');
                setErreur('');
              }}
            >
              <i className="bi bi-box-arrow-in-right me-1.5"></i> Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthForm;
