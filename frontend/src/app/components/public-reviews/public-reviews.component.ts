import { Component, OnInit } from '@angular/core';
import { FlightReviewService } from '../../services/flight-review.service';
import { FlightReview } from '../../models/flight-review.model';
import {CommonModule, DatePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-public-reviews',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    CommonModule
  ],
  templateUrl: './public-reviews.component.html',
  styleUrl: './public-reviews.component.css'
})
export class PublicReviewsComponent implements OnInit {

  reviews: FlightReview[] = [];
  filteredReviews: FlightReview[] = [];
  loading = false;
  errorMessage = '';

  constructor(private flightReviewService: FlightReviewService) { }

  ngOnInit(): void {
    this.loadPublishedReviews();
  }

  /**
   * Charger les avis publiés
   */
  loadPublishedReviews(): void {
    this.loading = true;
    this.flightReviewService.getPublishedReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.filteredReviews = reviews;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des avis';
        this.loading = false;
        console.error('Erreur:', error);
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
   * Obtenir la couleur de la note
   */
  getRatingColor(rating: number): string {
    if (rating >= 4) return 'text-success';
    if (rating >= 3) return 'text-warning';
    return 'text-danger';
  }

}
