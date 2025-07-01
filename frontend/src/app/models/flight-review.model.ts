// models/flight-review.model.ts
export interface FlightReview {
  id?: number;
  flightNumber: string;
  airline: string;
  flightDate: string;
  rating: number; // 1-5
  comment: string;
  createdAt?: string;
  status?: ReviewStatus;
  adminResponse?: AdminResponse;
}

export interface AdminResponse {
  id?: number;
  responseText: string;
  createdAt?: string;
  adminName?: string;
  flightReviewId?: number;
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  NO_RESPONSE = 'NO_RESPONSE'
}

// Interface pour les requêtes de création d'avis
export interface CreateFlightReviewRequest {
  flightNumber: string;
  airline: string;
  flightDate: string;
  rating: number;
  comment: string;
}

// Interface pour les requêtes de réponse admin
export interface CreateAdminResponseRequest {
  flightReviewId: number;
  responseText: string;
  adminName: string;
}

// Interface pour la mise à jour de statut
export interface UpdateStatusRequest {
  status: ReviewStatus;
}

// Interface pour les filtres de recherche
export interface ReviewSearchFilters {
  airline?: string;
  flightNumber?: string;
  rating?: number;
  status?: ReviewStatus;
  flightDate?: string;
  keyword?: string;
}

// Interface pour la pagination
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
