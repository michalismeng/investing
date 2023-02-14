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
                let initial = facts.initial.sort((a, b) => a.report != b.report ? a.report - b.report : a.line - b.line);
                let view = facts.view.sort((a, b) => a.report != b.report ? a.report - b.report : a.line - b.line);
                this.initialFacts = initial
                this.financialsSubject.next(view)
                this.loadingSubject.next(false)
            }
        )
    }

    resetFacts() {
        this.financialsSubject.next(this.initialFacts)
    }
}
