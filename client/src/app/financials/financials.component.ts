import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { filter, map, Observable, take, tap } from 'rxjs';
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
  public selection: SelectionModel<FactRow>;

  constructor(
    private financialsService: FinancialsService,
  ) {
      this.dataSource = new FinancialsDataSource(this.financialsService);
      this.columns$ = this.dataSource.columns$.pipe(map(cs => cs.filter(this.columnFilter.bind(this))));
      this.dataSource.financialsSubject.asObservable().subscribe(
        rows => this.factRows = rows
      )
    this.selection = new SelectionModel<FactRow>(true, []);
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
    this.selection.clear()
    this.financialsService.addScheme({
      "name": this.companyName,
      "stmt": this.currentStmt,
      value: this.scheme
    }).pipe(take(1)).subscribe(_ => this.loadStatement(this.currentStmt))
  }  

  public resetEditCommands() {
    this.dataSource.resetFacts()
  }

  // Generate combine command, for fact rows with the same plabel
  public generateCombineSame() {
    let rows = this.dataSource.financialsSubject.value
    let groups = this.groupBy(rows, item => item.plabel)
    let sch = Object.keys(groups)
                    .map(g => groups[g]) // get FactRows for each group of same plabel
                    .filter(r => r.length > 1) // keep only rows with multiple same plabels
                    .map(r => r.map(rr => rr.tag)) // keep only tags
                    .map(r => `combine: ${r.join(" ")},\n`) // convert to combine statement
                    .join("")
    this.scheme += sch;
  }

  public generate(command: string) {
    let args = this.selection.selected.map(f => f.tag).join(" ")
    let percentCommand = `${command}: ${args}`
    this.scheme += `${percentCommand},\n`
  }

  public beautifyScheme() {
    this.scheme = this.scheme.trim()
                             .split(",")
                             .map(t => t.trim())
                             .join(",\n")
  }

  private groupBy<T>(arr: T[], fn: (item: T) => any) {
    return arr.reduce<Record<string, T[]>>((prev, curr) => {
        const groupKey = fn(curr);
        const group = prev[groupKey] || [];
        group.push(curr);
        return { ...prev, [groupKey]: group };
    }, {});
  }
}