// Service d'authentification : Communique avec l'API Laravel Sanctum
const API_URL = 'http://localhost:8000/api';

class AuthService {

  /* En-têtes communs JSON */
  static getHeaders(avecToken = false) {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(avecToken && token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /* Connexion : username + mot de passe → token Sanctum */
  static async login(username, password) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.errors?.username?.[0]
        || data?.message
        || 'Identifiants incorrects.';
      throw new Error(message);
    }

    // Persistance du token et de l'utilisateur
    localStorage.setItem('token', data.token);
    localStorage.setItem('vtc_user', JSON.stringify(data.utilisateur));

    return data.utilisateur;
  }

  /* Inscription → token Sanctum + redirection auto */
  static async register(formData) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Extrait le premier message d'erreur de validation Laravel
      const premiereErreur = Object.values(data?.errors || {})[0]?.[0]
        || data?.message
        || "Erreur lors de l'inscription.";
      throw new Error(premiereErreur);
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('vtc_user', JSON.stringify(data.utilisateur));

    return data.utilisateur;
  }

  /* Déconnexion : révocation du token côté serveur */
  static async logout() {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('vtc_user');
    }
  }
}

export default AuthService;
