import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SubmissionsService } from 'src/services/submissions.service';
import { HttpClientModule } from '@angular/common/http';
import { SubmissionsComponent } from './submissions/submissions.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SubmissionsFiltersComponent } from './submissions-filters/submissions-filters.component';
import { FinancialsComponent } from './financials/financials.component';
import { FinancialsService } from 'src/services/financials.service';
import { AmountPipe } from 'src/pipes/amount.pipe';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule, MatTooltipDefaultOptions } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FormStorageDirective } from 'src/directives/form-storage.directive';
import { WordizePipe } from 'src/pipes/wordize.pipe';
import { FlexLayoutModule } from '@angular/flex-layout';
import { WatchlistComponent } from './watchlist/watchlist.component';

export const customTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 300,
  hideDelay: 100,
  touchendHideDelay: 100
}

@NgModule({
  declarations: [
    AppComponent,
    SubmissionsComponent,
    SubmissionsFiltersComponent,
    FinancialsComponent,
    AmountPipe,
    FormStorageDirective,
    WordizePipe,
    WatchlistComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatToolbarModule,
    ClipboardModule,
  ],
  providers: [
    SubmissionsService,
    FinancialsService,
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: customTooltipDefaults }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
