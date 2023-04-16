import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialsComponent } from './financials/financials.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { CompanyComponent } from './company/company.component';

const routes: Routes = [
  { path: '', redirectTo: 'companies', pathMatch: 'full' },
  { path: 'companies', component: CompanyComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'submissions', component: SubmissionsComponent },
  { path: 'submissions/:name', component: SubmissionsComponent },
  { path: 'financials', component: FinancialsComponent },
  { path: 'financials/:name', component: FinancialsComponent },
  { path: 'financials/:name', component: FinancialsComponent },
  { path: 'analysis', loadChildren: () => import('./analysis/analysis.module').then(m => m.AnalysisModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
