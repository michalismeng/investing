import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FinancialsComponent } from './financials/financials.component';
import { SubmissionsComponent } from './submissions/submissions.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { CompanyComponent } from './company/company.component';

const routes: Routes = [
  { path: '', redirectTo: 'companies', pathMatch: 'full' },
  { path: 'companies', component: CompanyComponent },
  { path: 'companies/:name/submissions', component: SubmissionsComponent },
  { path: 'companies/:name/financials', component: FinancialsComponent },
  { path: 'watchlist', component: WatchlistComponent },
  { path: 'analysis', loadChildren: () => import('./analysis/analysis.module').then(m => m.AnalysisModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
