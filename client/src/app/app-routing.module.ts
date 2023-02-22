import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialsComponent } from './financials/financials.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { WatchlistComponent } from './watchlist/watchlist.component';

const routes: Routes = [
  { path: '', redirectTo: 'watchlist', pathMatch: 'full' },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'submissions', component: SubmissionsComponent },
  { path: 'financials', component: FinancialsComponent },
  { path: 'financials/:name', component: FinancialsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
