/**
 * Types génériques pour les réponses API
 * Une seule interface de pagination réutilisable partout
 */

/** Réponse standard du backend */
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

/** Structure de données paginées Spring Boot — réutilisable dans chaque service */
export interface PaginatedData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

/** Paramètres de pagination pour les requêtes */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

/** Erreur API structurée */
export interface ApiError {
  title: string;
  status: number;
  detail: string;
  errorCode: string;
  timestamp: string;
}
