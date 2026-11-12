// Configuration de base de l'URL de l'API Laravel
const API_URL = 'http://localhost:8000/api';

// Service API Course : Délégué à 100% au backend Laravel
class GestionCoursesService {
  // Récupère les en-têtes HTTP avec le token d'authentification éventuel
  static getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // CREATE : Envoie une nouvelle demande de course au backend Laravel
  static async ajouterCourse(donnees) {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(donnees),
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la course');
    return await response.json();
  }

  // READ : Récupère la liste des courses depuis la base de données via Laravel
  static async getToutesCourses() {
    const response = await fetch(`${API_URL}/courses`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des courses');
    return await response.json();
  }

  // READ : Récupère une course spécifique par son identifiant
  static async getCourseParId(id) {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Course non trouvée');
    return await response.json();
  }

  // UPDATE : Met à jour les informations d'une course
  static async modifierCourse(id, donneesModifiees) {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(donneesModifiees),
    });
    if (!response.ok) throw new Error('Erreur lors de la mise à jour de la course');
    return await response.json();
  }

  // UPDATE : Change le statut de la course (accepter, démarrer, terminer)
  static async changerStatutCourse(id, statut, donneesChauffeur = null) {
    const response = await fetch(`${API_URL}/courses/${id}/statut`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ statut, ...donneesChauffeur }),
    });
    if (!response.ok) throw new Error('Erreur lors du changement de statut');
    return await response.json();
  }

  // DELETE : Supprime ou annule une course dans la base de données
  static async supprimerCourse(id) {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return await response.json();
  }

  // STATISTIQUES : Récupère les statistiques calculées par Laravel
  static async getStatistiques() {
    const response = await fetch(`${API_URL}/statistiques`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return await response.json();
  }
}

export default GestionCoursesService;
