import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Submission } from 'src/models/submission';
import { SubmissionsService } from 'src/services/submissions.service';
import { SubmissionsFilters } from '../submissions-filters/submissions-filters.component';
import { SubmissionsDataSource } from './submissions-data-source';
import { CompanyService } from 'src/services/company.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss']
})
export class SubmissionsComponent implements OnInit {

  public dataSource: SubmissionsDataSource;
  public columnsToDisplay = ["select", "name", "form", "fy"];
  public selection: SelectionModel<Submission> = new SelectionModel<Submission>(true, [], true, (a, b) => a.adsh == b.adsh);
  private name: string = "";
  private currentSubmissions: Submission[] = [];
  public selectedSubmissions: BehaviorSubject<Submission[]> = new BehaviorSubject<Submission[]>([]);

  constructor(
    private submissionsService: SubmissionsService,
    private companiesService: CompanyService,
    private route: ActivatedRoute,
  ) {
      this.dataSource = new SubmissionsDataSource(this.submissionsService);
      this.dataSource.submissions$.subscribe(
        subs => this.currentSubmissions = subs
      )
  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.name = params["name"];
      this.companiesService.getCompany(params["name"]).subscribe(c => {
        this.submissionsService.fromAdsh(c.submissions!).subscribe(
          subs => {
            this.selectedSubmissions.next(subs);
            this.selectedSubmissions.subscribe(s => this.companiesService.setSubmissions(this.name, s).subscribe())
          }
        )
      })
    })
  }

  public addToSelection() {
    let value = this.selectedSubmissions.value.concat(...this.selection.selected)
    // distinct
    value = value.filter((item, i, ar) => ar.findIndex(s => s.adsh == item.adsh) === i);
    this.selectedSubmissions.next(value)
  }

  public removeFromSelection(sub: Submission) {
    let value = this.selectedSubmissions.value.filter(s => s.adsh != sub.adsh)
    this.selectedSubmissions.next(value)
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
