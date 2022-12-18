import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, filter, map, Observable, tap } from 'rxjs';
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

    applyEditCommand(scheme: string) {
        let value = JSON.parse(JSON.stringify(this.financialsSubject.value)) as FactRow[]
        let commands = scheme.trim().split(",").map(t => t.trim())
        for(let command of commands) {
          if (command.startsWith("combine:")) {
            let args = command.split(":")[1].trim().split(" ")
            let fact0 = value.findIndex(f => f.tag == args[0])
            let fact1 = value.findIndex(f => f.tag == args[1])
            // Using this method, if both facts have a null column, then the column will disappear
            let combined = {...this.omitNull(value[fact1]), ...this.omitNull(value[fact0])}
            value[fact0] = combined
            value.splice(fact1, 1)
          }
        }
        this.financialsSubject.next(value)
    }
}
