import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { FlightReviewService } from '../../services/flight-review.service';
import {
  FlightReview,
  ReviewStatus,
  ReviewSearchFilters,
  PagedResponse,
  CreateAdminResponseRequest
} from '../../models/flight-review.model';
import {CommonModule, DatePipe, SlicePipe} from "@angular/common";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    SlicePipe,
    CommonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  // Données
  reviews: FlightReview[] = [];
  selectedReview: FlightReview | null = null;
  pagedResponse: PagedResponse<FlightReview> | null = null;

  // Formulaires
  searchForm: FormGroup;
  responseForm: FormGroup;

  // États
  loading = false;
  submittingResponse = false;
  currentPage = 0;
  pageSize = 10;

  // Options
  airlineOptions: string[] = [];

  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private flightReviewService: FlightReviewService
  ) {
    this.searchForm = this.createSearchForm();
    this.responseForm = this.createResponseForm();
  }

  ngOnInit(): void {
    this.airlineOptions = this.flightReviewService.getAirlineOptions();
    this.searchReviews();
  }

  private createSearchForm(): FormGroup {
    return this.fb.group({
      airline: [''],
      flightNumber: [''],
      rating: [''],
      status: [''],
      flightDate: [''],
      keyword: ['']
    });
  }

  private createResponseForm(): FormGroup {
    return this.fb.group({
      responseText: [''],
      adminName: ['Admin']
    });
  }


  /**
   * Rechercher les avis
   */
  searchReviews(): void {
    this.loading = true;
    const filters: ReviewSearchFilters = this.searchForm.value;

    // Supprimer les valeurs vides
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof ReviewSearchFilters]) {
        delete filters[key as keyof ReviewSearchFilters];
      }
    });

    // Cas spécial : Non répondu
    if (filters.status === 'NO_RESPONSE') {
      this.handleNoResponseSearch(filters);
      return;
    }

    // Logique existante pour les autres cas
    if (filters.keyword) {
      this.handleKeywordSearch(filters);
    } else {
      this.handleStandardSearch(filters);
    }
  }

  /**
   * Gérer la recherche "Non répondu"
   */
  private handleNoResponseSearch(filters: ReviewSearchFilters): void {
    // Supprimer le status NO_RESPONSE des filtres pour ne pas l'envoyer au backend
    const { status, ...otherFilters } = filters;

    this.flightReviewService.getReviewsWithoutResponse().subscribe({
      next: (reviews) => {
        // Appliquer les autres filtres côté client si nécessaire
        if (Object.keys(otherFilters).length > 0) {
          this.reviews = this.applyClientSideFilters(reviews, otherFilters);
        } else {
          this.reviews = reviews;
        }
        this.pagedResponse = null;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche des avis non répondus';
        this.loading = false;
        console.error(error);
      }
    });
  }

  /**
   * Gérer la recherche par mot-clé
   */
  private handleKeywordSearch(filters: ReviewSearchFilters): void {
    this.flightReviewService.searchByKeyword(filters.keyword!).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.pagedResponse = null;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche par mot-clé';
        this.loading = false;
        console.error(error);
      }
    });
  }

  /**
   * Gérer la recherche standard (multicritères)
   */
  private handleStandardSearch(filters: ReviewSearchFilters): void {
    this.flightReviewService.searchReviews(filters, 0, this.pageSize).subscribe({
      next: (response) => {
        this.pagedResponse = response;
        this.reviews = response.content;
        this.currentPage = 0;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la recherche';
        this.loading = false;
        console.error(error);
      }
    });
  }

  /**
   * Appliquer les filtres côté client (pour les avis non répondus)
   */
  private applyClientSideFilters(reviews: FlightReview[], filters: any): FlightReview[] {
    return reviews.filter(review => {
      // Filtre par compagnie
      if (filters.airline && review.airline !== filters.airline) {
        return false;
      }

      // Filtre par numéro de vol
      if (filters.flightNumber && !review.flightNumber.toLowerCase().includes(filters.flightNumber.toLowerCase())) {
        return false;
      }

      // Filtre par note
      if (filters.rating && review.rating !== parseInt(filters.rating)) {
        return false;
      }

      // Filtre par date de vol
      if (filters.flightDate) {
        const filterDate = new Date(filters.flightDate);
        const reviewDate = new Date(review.flightDate);
        if (filterDate.getTime() !== reviewDate.getTime()) {
          return false;
        }
      }

      // Filtre par mot-clé dans les commentaires
      if (filters.keyword && !review.comment.toLowerCase().includes(filters.keyword.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  /**
   * Méthode pour ouvrir/fermer les détails de l'avis
   */
  toggleReviewDetails(review: FlightReview): void {
    if (this.selectedReview?.id === review.id) {
      this.selectedReview = null;
    } else {
      this.selectedReview = review;
    }
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchForm.reset();
  }

  /**
   * Fermer le détail d'un avis
   */
  closeReviewDetail(): void {
    this.selectedReview = null;  // On ferme simplement le modal en réinitialisant la sélection
  }


  /**
   * Mettre à jour le statut d'un avis
   */
  updateStatus(reviewId: number, status: ReviewStatus): void {
    this.flightReviewService.updateReviewStatus(reviewId, status).subscribe({
      next: (updatedReview) => {

        const index = this.reviews.findIndex(r => r.id === reviewId);
        if (index !== -1) {
          this.reviews[index] = updatedReview;
        }

        if (this.selectedReview && this.selectedReview.id === reviewId) {
          this.selectedReview = updatedReview;
        }

        this.successMessage = 'Statut mis à jour avec succès';
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour du statut';
        console.error(error);
      }
    });
  }

  /**
   * Soumettre une réponse à un avis
   */
  submitResponse(): void {
    if (!this.selectedReview || !this.responseForm.valid) return;

    this.submittingResponse = true;
    const formValue = this.responseForm.value;

    const responseData: CreateAdminResponseRequest = {
      flightReviewId: this.selectedReview.id!,
      responseText: formValue.responseText,
      adminName: formValue.adminName
    };

    this.flightReviewService.createAdminResponse(responseData).subscribe({
      next: (response) => {
        this.successMessage = 'Réponse ajoutée avec succès';
        this.submittingResponse = false;
        if (this.selectedReview?.id) {
          this.flightReviewService.getReviewById(this.selectedReview.id).subscribe({
            next: (updatedReview) => {
              this.selectedReview = updatedReview;
              // Mettre à jour dans la liste aussi
              const index = this.reviews.findIndex(r => r.id === updatedReview.id);
              if (index !== -1) {
                this.reviews[index] = updatedReview;
              }
            }
          });
        }

        this.responseForm.reset();
        this.clearMessagesAfterDelay();
      },
      error: (error) => {
        console.log("responsedata :", responseData)
        this.errorMessage = 'Erreur lors de l\'ajout de la réponse';
        this.submittingResponse = false;
        console.error(error);
      }
    });
  }

  /**
   * Formater la note en étoiles
   */
  formatRating(rating: number): string {
    return this.flightReviewService.formatRatingAsStars(rating);
  }

  /**
   * Formater le statut
   */
  formatStatus(status: ReviewStatus): string {
    return this.flightReviewService.formatStatus(status);
  }

  /**
   * Obtenir la classe CSS pour le statut
   */
  getStatusClass(status: ReviewStatus): string {
    const statusClasses = {
      'PENDING': 'badge bg-warning',
      'PUBLISHED': 'badge bg-success',
      'REJECTED': 'badge bg-danger',
      'RESPONDED': 'badge bg-info',
      'NO_RESPONSE': 'badge bg-secondary'
    };
    return statusClasses[status] || 'badge bg-secondary';
  }

  /**
   * Effacer les messages après un délai
   */
  private clearMessagesAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 5000);
  }

  protected readonly ReviewStatus = ReviewStatus;
}
