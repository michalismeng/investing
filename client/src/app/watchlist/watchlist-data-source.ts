import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, forkJoin, map, Observable } from 'rxjs';
import { Submission } from 'src/models/submission';
import { WatchlistEntry } from 'src/models/watchlist';
import { FinancialsService } from 'src/services/financials.service';
import { SubmissionsService } from 'src/services/submissions.service';


export class WatchlistDataSource implements DataSource<{ watchlist: WatchlistEntry, submissions: Submission[] }> {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private watchlistsSubject = new BehaviorSubject<{ watchlist: WatchlistEntry, submissions: Submission[] }[]>([]);
    public watchlists$: Observable<{ watchlist: WatchlistEntry, submissions: Submission[] }[]>;

    constructor(
        private financialsService: FinancialsService,
        private submissionsService: SubmissionsService,
    ) {
        this.watchlists$ = this.watchlistsSubject.asObservable()
    }

    connect(collectionViewer: CollectionViewer): Observable<{ watchlist: WatchlistEntry, submissions: Submission[] }[]> {
        return this.watchlistsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.loadingSubject.complete();
    }

    loadWatchlists() {
        this.loadingSubject.next(true);
        this.financialsService.getWatchlists().subscribe(
            watchlists => {
                forkJoin(watchlists.map(w => this.submissionsService.fromAdsh(w.adsh)
                                                                    .pipe(map(sub => { return { watchlist: w, submissions: sub } })))
                        ).subscribe(x => this.watchlistsSubject.next(x))
            }
        )
    }
}
