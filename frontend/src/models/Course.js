// Modèle Course : Représente une course Taxi/VTC (inspiré d'Uber et inDrive)
class Course {
  // Initialisation d'une nouvelle course avec ses informations de trajet et de statut
  constructor(
    id,
    depart,
    arrivee,
    distance,
    prix,
    typeVehicule = 'Standard',
    nomClient = 'Client Passager',
    telephoneClient = '0600000000',
    statut = 'En attente',
    date = new Date().toISOString(),
    chauffeur = null
  ) {
    this.id = id;
    this.depart = depart;
    this.arrivee = arrivee;
    this.distance = distance;
    this.prix = prix;
    this.typeVehicule = typeVehicule;
    this.nomClient = nomClient;
    this.telephoneClient = telephoneClient;
    this.statut = statut;
    this.date = date;
    this.chauffeur = chauffeur;
  }

  // Calcul du tarif indicatif selon la distance et la catégorie du véhicule
  static estimerPrix(distance, typeVehicule = 'Standard', prixBase = 10, prixParKm = 6) {
    let multiplicateur = 1.0;
    if (typeVehicule === 'Confort') multiplicateur = 1.3;
    if (typeVehicule === 'Van') multiplicateur = 1.6;

    const estimation = (prixBase + distance * prixParKm) * multiplicateur;
    return Math.round(estimation);
  }

  // Acceptation de la course par un chauffeur avec le prix convenu (style inDrive)
  accepter(donneesChauffeur, prixConvenu = null) {
    this.statut = 'Acceptée';
    this.chauffeur = donneesChauffeur;
    if (prixConvenu !== null) {
      this.prix = prixConvenu;
    }
  }

  // Méthodes de transition du statut de la course
  demarrer() {
    this.statut = 'En cours';
  }

  terminer() {
    this.statut = 'Terminée';
  }

  annuler() {
    this.statut = 'Annulée';
  }

  // Vérifie si la course est en cours de traitement
  estActive() {
    return this.statut === 'En attente' || this.statut === 'Acceptée' || this.statut === 'En cours';
  }
}

export default Course;
