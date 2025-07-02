// services/flight-review.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  FlightReview,
  AdminResponse,
  CreateFlightReviewRequest,
  CreateAdminResponseRequest,
  UpdateStatusRequest,
  ReviewSearchFilters,
  PagedResponse,
  ReviewStatus,
} from '../models/flight-review.model';

@Injectable({
  providedIn: 'root'
})
export class FlightReviewService {

  private readonly API_URL = '/api';

  constructor(private http: HttpClient) { }

  // === GESTION DES AVIS ===

  /**
   * Créer un nouvel avis (partie client)
   */
  createReview(reviewData: CreateFlightReviewRequest): Observable<FlightReview> {
    return this.http.post<FlightReview>(`${this.API_URL}/reviews`, reviewData);
  }

  /**
   * Récupérer un avis par ID
   */
  getReviewById(id: number): Observable<FlightReview> {
    return this.http.get<FlightReview>(`${this.API_URL}/reviews/${id}`);
  }

  /**
   * Récupérer les avis publiés (partie publique)
   */
  getPublishedReviews(): Observable<FlightReview[]> {
    return this.http.get<FlightReview[]>(`${this.API_URL}/reviews/public`);
  }

  /**
   * Récupérer les avis sans réponse
   */
  getReviewsWithoutResponse(): Observable<FlightReview[]> {
    return this.http.get<FlightReview[]>(`${this.API_URL}/reviews/no-response`);
  }


  /**
   * Recherche multicritères
   */
  searchReviews(
    filters: ReviewSearchFilters,
    page: number = 0,
    size: number = 10
  ): Observable<PagedResponse<FlightReview>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters.airline) params = params.set('airline', filters.airline);
    if (filters.flightNumber) params = params.set('flightNumber', filters.flightNumber);
    if (filters.rating) params = params.set('rating', filters.rating.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.flightDate) params = params.set('flightDate', filters.flightDate);

    return this.http.get<PagedResponse<FlightReview>>(`${this.API_URL}/reviews/search`, { params });
  }

  /**
   * Recherche par mot-clé
   */
  searchByKeyword(keyword: string): Observable<FlightReview[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<FlightReview[]>(`${this.API_URL}/reviews/search-keyword`, { params });
  }

  /**
   * Mettre à jour le statut d'un avis
   */
  updateReviewStatus(id: number, status: ReviewStatus): Observable<FlightReview> {
    const request: UpdateStatusRequest = { status };
    return this.http.put<FlightReview>(`${this.API_URL}/reviews/${id}/status`, request);
  }

  // === GESTION DES RÉPONSES ADMIN ===

  /**
   * Créer une réponse à un avis
   */
  createAdminResponse(responseData: CreateAdminResponseRequest): Observable<AdminResponse> {
    return this.http.post<AdminResponse>(`${this.API_URL}/admin-responses`, responseData);
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Obtenir les options de compagnies aériennes (liste statique pour simplifier)
   */
  getAirlineOptions(): string[] {
    return [
      'Air France',
      'British Airways',
      'Lufthansa',
      'KLM',
      'Emirates',
      'Qatar Airways',
      'American Airlines',
      'Delta Air Lines',
      'United Airlines',
      'Ryanair',
      'EasyJet'
    ];
  }

  /**
   * Formater la note en étoiles
   */
  formatRatingAsStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  /**
   * Formater le statut en français
   */
  formatStatus(status: ReviewStatus): string {
    const statusMap = {
      'PENDING': 'En attente',
      'PUBLISHED': 'Publié',
      'REJECTED': 'Rejeté',
      'RESPONDED': 'Répondu',
      'NO_RESPONSE': 'Non répondu'
    };
    return statusMap[status] || status;
  }
}
