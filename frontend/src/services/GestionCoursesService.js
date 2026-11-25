// Service API Course — Délégué à 100% au backend Laravel
const API_URL = 'http://localhost:8000/api';

class GestionCoursesService {

  /* En-têtes avec token Sanctum */
  static getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /* Lève une erreur lisible à partir d'une réponse Laravel */
  static async lireErreur(response) {
    try {
      const data = await response.json();
      return data?.message || `Erreur ${response.status}`;
    } catch {
      return `Erreur ${response.status}`;
    }
  }

  /* CREATE : Nouvelle demande de course */
  static async ajouterCourse(donnees) {
    const response = await fetch(`${API_URL}/courses`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        depart:        donnees.depart,
        depart_lat:    donnees.depart_lat ?? null,
        depart_lon:    donnees.depart_lon ?? null,
        arrivee:       donnees.arrivee || donnees.destination,
        arrivee_lat:   donnees.arrivee_lat ?? null,
        arrivee_lon:   donnees.arrivee_lon ?? null,
        distance:      donnees.distance ?? 5,
        prix:          donnees.prix,
        type_vehicule: donnees.typeVehicule || donnees.type_vehicule || 'Standard',
      }),
    });
    if (!response.ok) throw new Error(await this.lireErreur(response));
    return await response.json();
  }

  /* READ : Liste des courses (filtrée par rôle côté backend) */
  static async getToutesCourses() {
    const response = await fetch(`${API_URL}/courses`, { headers: this.getHeaders() });
    if (!response.ok) throw new Error(await this.lireErreur(response));
    return await response.json();
  }

  /* READ : Détail d'une course */
  static async getCourseParId(id) {
    const response = await fetch(`${API_URL}/courses/${id}`, { headers: this.getHeaders() });
    if (!response.ok) throw new Error('Course non trouvée');
    return await response.json();
  }

  /* UPDATE : Modification du prix (négociation inDrive) */
  static async modifierCourse(id, donnees) {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(donnees),
    });
    if (!response.ok) throw new Error(await this.lireErreur(response));
    return await response.json();
  }

  /* UPDATE STATUT : Acceptée / En cours / Terminée / Annulée */
  static async changerStatutCourse(id, statut) {
    const response = await fetch(`${API_URL}/courses/${id}/statut`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ statut }),
    });
    if (!response.ok) throw new Error(await this.lireErreur(response));
    return await response.json();
  }

  /* DELETE : Annulation / suppression d'une course */
  static async supprimerCourse(id) {
    const response = await fetch(`${API_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error(await this.lireErreur(response));
    return await response.json();
  }

  /* ESTIMATION : Prix calculé par le backend selon le tarif et la distance */
  static async estimerPrix(distance, typeVehicule) {
    const params = new URLSearchParams({ distance, type_vehicule: typeVehicule });
    const response = await fetch(`${API_URL}/tarifs/estimer?${params}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Erreur estimation prix');
    return await response.json(); // { prix_estime, type_vehicule }
  }

  /* STATISTIQUES : Tableau de bord admin */
  static async getStatistiques() {
    const response = await fetch(`${API_URL}/statistiques`, { headers: this.getHeaders() });
    if (!response.ok) throw new Error(await this.lireErreur(response));
    return await response.json();
  }
}

export default GestionCoursesService;
