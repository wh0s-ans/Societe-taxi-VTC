import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ListeCourses from './components/ListeCourses';
import AuthPage from './pages/AuthPage';
import PassagerPage from './pages/PassagerPage';
import GestionCoursesService from './services/GestionCoursesService';
import Course from './models/Course';
import './index.css';

// Composant racine : Gère le cycle de vie de la session et la navigation
function App() {
  // État de l'utilisateur connecté (null = affiche la Landing/Login Page)
  const [utilisateur, setUtilisateur] = useState(() => {
    const sauvegarde = localStorage.getItem('vtc_user');
    return sauvegarde ? JSON.parse(sauvegarde) : null;
  });

  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState(null);

  // Charger les courses si l'utilisateur est authentifié
  useEffect(() => {
    if (utilisateur) {
      chargerCourses();
    }
  }, [utilisateur]);

  // Récupération des courses depuis Laravel ou fallback de démo
  const chargerCourses = async () => {
    try {
      const data = await GestionCoursesService.getToutesCourses();
      setCourses(data);
    } catch {
      setCourses([
        new Course(1, 'Marina Agadir', 'Souk El Had', 6, 35, 'Standard', 'Sara Alami', '0698765432', 'En attente'),
        new Course(2, 'Aéroport Agadir Al Massira', 'Taghazout Bay', 42, 280, 'Confort', 'Mehdi Benali', '0612345678', 'En cours', new Date().toISOString(), {
          nom: 'Karim Tazi',
          vehicule: 'Dacia Logan - Blanche (12345-A-33)',
        }),
      ]);
    }
  };

  // Gestion de la connexion réussie
  const handleLoginSuccess = (donneesUtilisateur) => {
    setUtilisateur(donneesUtilisateur);
    localStorage.setItem('vtc_user', JSON.stringify(donneesUtilisateur));
  };

  // Gestion de la déconnexion
  const handleDeconnexion = () => {
    setUtilisateur(null);
    localStorage.removeItem('vtc_user');
    localStorage.removeItem('token');
  };

  const afficherNotification = (texte, type = 'success') => {
    setMessage({ texte, type });
    setTimeout(() => setMessage(null), 3500);
  };

  // Demande de course (rôle Passager)
  const handleDemanderCourse = async (donneesCourse) => {
    const courseAvecClient = {
      ...donneesCourse,
      nomClient: utilisateur?.nom || donneesCourse.nomClient,
      telephoneClient: utilisateur?.telephone || donneesCourse.telephoneClient,
    };

    try {
      await GestionCoursesService.ajouterCourse(courseAvecClient);
      chargerCourses();
    } catch {
      const nouvelle = new Course(
        Date.now(),
        courseAvecClient.depart,
        courseAvecClient.arrivee,
        courseAvecClient.distance,
        courseAvecClient.prix,
        courseAvecClient.typeVehicule,
        courseAvecClient.nomClient,
        courseAvecClient.telephoneClient,
        'En attente'
      );
      setCourses((anciennes) => [nouvelle, ...anciennes]);
    }
    afficherNotification('Demande de course envoyée avec succès !');
  };

  // Changement de statut (rôle Chauffeur)
  const handleChangerStatut = async (id, nouveauStatut, donneesChauffeur = null) => {
    const chauffeurInfos = donneesChauffeur || {
      nom: utilisateur?.nom || 'Chauffeur Partenaire',
      vehicule: utilisateur?.vehicule || 'Véhicule VTC Partenaire',
    };

    try {
      await GestionCoursesService.changerStatutCourse(id, nouveauStatut, chauffeurInfos);
      chargerCourses();
    } catch {
      setCourses((anciennes) =>
        anciennes.map((c) => (c.id === id ? { ...c, statut: nouveauStatut, chauffeur: chauffeurInfos } : c))
      );
    }
    afficherNotification(`Course mise à jour : Statut "${nouveauStatut}"`);
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette course ?')) return;

    try {
      await GestionCoursesService.supprimerCourse(id);
      chargerCourses();
    } catch {
      setCourses((anciennes) => anciennes.filter((c) => c.id !== id));
    }
    afficherNotification('Course annulée.', 'warning');
  };

  // SI NON AUTHENTIFIÉ : Afficher le Split-Layout immersif Welcome / Login / Register
  if (!utilisateur) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // SI AUTHENTIFIÉ : Afficher l'application VTC adaptée au rôle
  const estChauffeur = utilisateur.role === 'chauffeur';

  // Vue Passager : flux inDrive complet (formulaire → attente → course)
  if (!estChauffeur) {
    return <PassagerPage utilisateur={utilisateur} onDeconnexion={handleDeconnexion} />;
  }

  // Vue Chauffeur : liste des courses disponibles + assignées
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar utilisateur={utilisateur} onDeconnexion={handleDeconnexion} />

      <main className="container py-4 flex-grow-1" style={{ maxWidth: '800px' }}>
        {message && (
          <div className={`alert alert-${message.type} alert-dismissible fade show rounded-4 shadow-sm mb-4`} role="alert">
            <i className="bi bi-info-circle-fill me-2"></i>
            {message.texte}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Courses disponibles & assignées</h5>
          <span className="badge bg-secondary rounded-pill">{courses.length}</span>
        </div>

        <ListeCourses
          courses={courses}
          roleActuel={utilisateur.role}
          onChangerStatut={handleChangerStatut}
          onSupprimer={handleSupprimer}
        />
      </main>
    </div>
  );
}

export default App;
