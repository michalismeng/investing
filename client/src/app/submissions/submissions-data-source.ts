import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Submission } from 'src/models/submission';
import { SubmissionsService } from 'src/services/submissions.service';


export class SubmissionsDataSource implements DataSource<Submission> {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private submissionsSubject = new BehaviorSubject<Submission[]>([]);
    public submissions$: Observable<Submission[]>;
    public submissionsCount$: Observable<number>;

    constructor(private submissionsService: SubmissionsService) {
        this.submissionsCount$ = this.submissionsSubject.pipe(map(s => s.length))
        this.submissions$ = this.submissionsSubject.asObservable()
    }

    connect(collectionViewer: CollectionViewer): Observable<Submission[]> {
        return this.submissionsSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.loadingSubject.complete();
    }

    loadSubmissions(page = 1, pageSize = 10, name: string = "", form: string = "") {
        this.loadingSubject.next(true);
        this.submissionsService.getSubmissions(name, form).subscribe(
            subs => this.submissionsSubject.next(subs)
        )
    }
}
