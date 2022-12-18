import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { filter, map, Observable, take } from 'rxjs';
import { FactRow, factRowStaticKeys } from 'src/models/fact';
import { Submission } from 'src/models/submission';
import { FinancialsService } from 'src/services/financials.service';
import { FinancialsDataSource } from './financials-data-source';

@Component({
  selector: 'app-financials',
  templateUrl: './financials.component.html',
  styleUrls: ['./financials.component.scss']
})
export class FinancialsComponent {

  public dataSource: FinancialsDataSource;
  public columns$: Observable<string[]>;
  public companyName: string = "";

  public factRowStaticKeys = factRowStaticKeys;
  public staticKeysToShow: string[] = ["plabel"];

  public factRows: FactRow[] = [];
  public currentStmt: string = "IS";
  public statementName = {
    "IS": "Income Statement",
    "BS": "Balance Sheet",
    "CF": "Cashflow Statement"
  }
  public scheme: string = "";

  constructor(
    private financialsService: FinancialsService,
  ) {
      this.dataSource = new FinancialsDataSource(this.financialsService);
      this.columns$ = this.dataSource.columns$.pipe(map(cs => cs.filter(this.columnFilter.bind(this))));
      this.dataSource.financialsSubject.asObservable().subscribe(
        rows => this.factRows = rows
      )
  }

  private columnFilter(c: string): boolean {
    return !factRowStaticKeys.includes(c) || this.staticKeysToShow.includes(c)
  }

  ngOnInit(): void {
    let selectedSubmissions = JSON.parse(localStorage.getItem("selectedSubmissions")!) as Submission[]
    this.companyName = selectedSubmissions[0].name;
    this.loadStatement("IS")
  }

  public loadStatement(stmt: string) {
    this.currentStmt = stmt;
    let selectedSubmissions = JSON.parse(localStorage.getItem("selectedSubmissions")!) as Submission[]
    this.dataSource.loadFacts(selectedSubmissions.map(s => s.adsh), stmt);
    this.dataSource.loading$.pipe(filter(l => l == false), take(1)).subscribe(_ => {
      this.financialsService.getScheme(this.companyName, this.currentStmt).subscribe(scheme => {
        this.scheme = scheme.value;
        this.applyEditCommands()
      })
    })
  }

  public parseDate(dt: string) {
    if(isNaN(parseInt(dt))) return dt
    let dateStr = dt.slice(0, 4) + "-" + dt.slice(4, 6) + "-" + dt.slice(6, 8)
    let date = Date.parse(dateStr)
    return formatDate(date, "MMM y", "en-US")
  }

  public applyEditCommands() {
    this.financialsService.addScheme({ "name": this.companyName, "stmt": this.currentStmt, value: this.scheme }).pipe(take(1)).subscribe()
    this.dataSource.resetFacts()
    this.dataSource.applyEditCommand(this.scheme)
  }  

  public resetEditCommands() {
    this.dataSource.resetFacts()
  }
}