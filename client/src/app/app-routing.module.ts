import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialsComponent } from './financials/financials.component';
import { SubmissionsComponent } from './submissions/submissions.component';

const routes: Routes = [
  { path: '', redirectTo: 'submissions', pathMatch: 'full' },
  { path: 'submissions', component: SubmissionsComponent },
  { path: 'financials', component: FinancialsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
