import { CollectionViewer } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company } from 'src/models/company';
import { CompanyService } from 'src/services/company.service';

export class CompanyDataSource implements DataSource<Company> {

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    private companiesSubject = new BehaviorSubject<Company[]>([]);
    public companies$: Observable<Company[]>;

    constructor(
        private companiesService: CompanyService,
    ) {
        this.companies$ = this.companiesSubject.asObservable()
    }

    connect(collectionViewer: CollectionViewer): Observable<Company[]> {
        return this.companiesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.loadingSubject.complete();
    }

    loadCompanies() {
        this.loadingSubject.next(true);
        this.companiesService.getCompanies().subscribe(cs => this.companiesSubject.next(cs))
    }
}
