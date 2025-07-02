import {Component} from '@angular/core';
import {CommonModule} from "@angular/common";
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(
    private router: Router,
  ) { }

  /**
   * Naviguer vers le formulaire d'avis
   */
  goToReviewForm(): void {
    this.router.navigate(['/laisser-avis']);
  }

  /**
   * Naviguer vers la page des avis publics
   */
  goToPublicReviews(): void {
    this.router.navigate(['/avis-publics']);
  }
}
