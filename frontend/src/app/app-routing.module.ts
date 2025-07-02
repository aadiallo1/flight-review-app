import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';
import { PublicReviewsComponent } from './components/public-reviews/public-reviews.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'laisser-avis', component: ReviewFormComponent },
  { path: 'avis-publics', component: PublicReviewsComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
