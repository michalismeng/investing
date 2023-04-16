import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, map, Observable, take, tap } from 'rxjs';
import { FactRow, factRowStaticKeys } from 'src/models/fact';
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
  public scheme: string = "";
  public showSchemeEditor: boolean = false;
  public selection: SelectionModel<FactRow>;

  constructor(
    private financialsService: FinancialsService,
    private route: ActivatedRoute,
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
    this.route.params.subscribe(
      params => {
        this.companyName = params["name"]
        this.tabChanged(0);
      })
  }

  public loadStatement(stmt: string) {
    this.currentStmt = stmt;
    this.dataSource.loadFacts(this.companyName, stmt);
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

  public stmtIcon(stmt: string) {
    switch(stmt) {
      case "IS": return "payments";
      case "BS": return "balance";
      case "CF": return "air";
    }
    return "";
  }

  public stmtFullName(stmt: string) {
    switch(stmt) {
      case "IS": return "Income Statement";
      case "BS": return "Balance Sheet";
      case "CF": return "Cash Flow Statement";
    }
    return "";
  }

  public tabChanged(e: number) {
    switch(e) {
      case 0: this.loadStatement('IS'); return;
      case 1: this.loadStatement('BS'); return;
      case 2: this.loadStatement('CF'); return;
    }
  }
}