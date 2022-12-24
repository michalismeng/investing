import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, filter, lastValueFrom, map, Observable, tap } from 'rxjs';
import { FactRow, factRowStaticKeys } from 'src/models/fact';
import { FinancialsService } from 'src/services/financials.service';


export class FinancialsDataSource implements DataSource<FactRow> {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    public financialsSubject = new BehaviorSubject<FactRow[]>([]);
    public columns$ = new Observable<string[]>();
    private initialFacts: FactRow[] = [];

    constructor(private financialsService: FinancialsService) {
        this.columns$ = this.financialsSubject.pipe(
            filter(f => f.length > 0),
            map(f => Object.keys(f[0]).sort(this.sortColumns))
        )
    }

    private sortColumns(a: string, b: string): number {
        if(factRowStaticKeys.includes(a)) return -1;
        else return a < b ? -1 : 1;
    }

    connect(collectionViewer: CollectionViewer): Observable<FactRow[]> {
        return this.financialsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.loadingSubject.complete();
    }

    loadFacts(adsh: string[] = [], stmt: string = "IS") {
        this.loadingSubject.next(true);
        this.financialsService.getFacts(adsh, stmt).subscribe(
            facts => {
                this.initialFacts = facts.sort((a, b) => a.report != b.report ? a.report - b.report : a.line - b.line)
                this.financialsSubject.next(this.initialFacts)
                this.loadingSubject.next(false)
            }
        )
    }

    omitNull = (obj:any) => {
      Object.keys(obj).filter(k => obj[k] === null).forEach(k => delete(obj[k]))
      return obj
    }

    resetFacts() {
        this.financialsSubject.next(this.initialFacts)
    }

    private applyCombineCommand(args: string[], rows: FactRow[]) {
      let fact0 = rows.findIndex(f => f.tag == args[0])
      let fact1 = rows.findIndex(f => f.tag == args[1])
      // Using this method, if both facts have a null column, then the column will disappear
      let combined = {...this.omitNull(rows[fact1]), ...this.omitNull(rows[fact0])}
      rows[fact0] = combined
      rows.splice(fact1, 1)
    }

    private applyPercentCommand(args: string[], rows: FactRow[]) {
      let tag0 = rows.findIndex(f => f.tag == args[0])
      let tag1 = rows.findIndex(f => f.tag == args[1])
      let keys = Object.keys(rows[tag0]).filter(k => factRowStaticKeys.includes(k) == false)

      let plabel = args.length == 3 ? args[2] : `percent-${rows[tag0].tag}-${rows[tag1].tag}`

      let data = Object.fromEntries(keys.map(k => [k, rows[tag0][k] / rows[tag1][k]]))
      rows.push({
        tag: `percent-${rows[tag0].tag}-${rows[tag1].tag}`,
        line: rows[tag0].line + 0.5,
        plabel: plabel,
        report: rows[tag0].report,
        uom: "percent",
        ...data
      })
    }

    applyEditCommand(scheme: string) {
        let value = JSON.parse(JSON.stringify(this.financialsSubject.value)) as FactRow[]
        let commands = scheme.trim().split(",").map(t => t.trim())
        for(let command of commands) {
          let args = command.split(":")[1].trim().split(" ")
          if (command.startsWith("combine:")) {
            this.applyCombineCommand(args, value)
          } else if (command.startsWith("percent:")) {
            this.applyPercentCommand(args, value)
          } else if (command.startsWith("hide:")) {
            let index = value.findIndex(f => f.tag == args[0])
            value.splice(index, 1)
          }
        }
        this.financialsSubject.next(value.sort((a, b) => a.report != b.report ? a.report - b.report : a.line - b.line))
    }
}
