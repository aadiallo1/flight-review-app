import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { FlightReviewService } from '../../services/flight-review.service';
import { CreateFlightReviewRequest } from '../../models/flight-review.model';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.css'
})
export class ReviewFormComponent implements OnInit {

  reviewForm: FormGroup;
  airlineOptions: string[] = [];
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  selectedRating = 0;
  maxDate: string;

  constructor(
    private fb: FormBuilder,
    private flightReviewService: FlightReviewService
  ) {
    this.reviewForm = this.createForm();
    this.maxDate = this.getTodayDate();
  }

  ngOnInit(): void {
    this.airlineOptions = this.flightReviewService.getAirlineOptions();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      flightNumber: ['', [Validators.required, Validators.minLength(2)]],
      airline: ['', Validators.required],
      flightDate: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Définir la note via les étoiles
   */
  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  /**
   * Obtenir les étoiles pour l'affichage
   */
  getStars(): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  /**
   * Vérifier si une étoile est sélectionnée
   */
  isStarSelected(star: number): boolean {
    return star <= this.selectedRating;
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    if (this.reviewForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.submitError = '';

      const reviewData: CreateFlightReviewRequest = this.reviewForm.value;

      this.flightReviewService.createReview(reviewData).subscribe({
        next: (response) => {
          this.submitSuccess = true;
          this.isSubmitting = false;
          this.reviewForm.reset();
          this.selectedRating = 0;

          // Masquer le message de succès après 5 secondes
          setTimeout(() => {
            this.submitSuccess = false;
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitError = 'Une erreur est survenue lors de la soumission de votre avis. Veuillez réessayer.';
          console.error('Erreur lors de la soumission:', error);
        }
      });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.reviewForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est obligatoire.`;
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${minLength} caractères.`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${maxLength} caractères.`;
      }
      if (field.errors['min']) {
        return 'Veuillez sélectionner une note entre 1 et 5 étoiles.';
      }
      if (field.errors['max']) {
        return 'La note ne peut pas dépasser 5 étoiles.';
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'flightNumber': 'Le numéro de vol',
      'airline': 'La compagnie aérienne',
      'flightDate': 'La date de vol',
      'rating': 'La note',
      'comment': 'Le commentaire'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.reviewForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.reviewForm.reset();
    this.selectedRating = 0;
    this.submitSuccess = false;
    this.submitError = '';
  }
}
