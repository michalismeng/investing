import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Submission } from 'src/models/submission';
import { FinancialsService } from 'src/services/financials.service';
import { SubmissionsService } from 'src/services/submissions.service';
import { SubmissionsFilters } from '../submissions-filters/submissions-filters.component';
import { SubmissionsDataSource } from './submissions-data-source';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss']
})
export class SubmissionsComponent implements OnInit {

  public dataSource: SubmissionsDataSource;
  public columnsToDisplay = ["select", "name", "form", "fy", "period", "filed", "accepted"];
  public selection: SelectionModel<Submission>;
  public watchlistName: string = "";

  private currentSubmissions: Submission[] = [];

  constructor(
    private submissionsService: SubmissionsService,
    private financialsService: FinancialsService,
    private router: Router,
  ) {
      this.dataSource = new SubmissionsDataSource(this.submissionsService);
      this.dataSource.submissions$.subscribe(
        subs => this.currentSubmissions = subs
      )

    this.selection = new SelectionModel<Submission>(true, []);
  }
  
  ngOnInit(): void {
    this.dataSource.loadSubmissions();
  }

  public filtersChanged(filters: SubmissionsFilters) {
    this.selection.clear()
    this.dataSource.loadSubmissions(0, 0, filters.nameSelection, filters.formSelection)
  }

  public getFiscalYearFormatted(sub: Submission) {
    let dateStr = sub.fy + "-" + sub.fye.slice(0, 2) + "-" + sub.fye.slice(2, 4)
    let date = Date.parse(dateStr)
    return date 
  }

  public navigateToFinancials() {
    localStorage.setItem("selectedSubmissions", JSON.stringify(this.selection.selected))
    this.router.navigate(["/financials"])
  }

  public addToWatchlist() {
    this.financialsService.addWatchlist(this.watchlistName, this.selection.selected.map(s => s.adsh))
                          .subscribe()
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.currentSubmissions.length;
    return numSelected == numRows;
  }

  toggleAllRows() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.currentSubmissions.forEach(row => this.selection.select(row));
  }
}
