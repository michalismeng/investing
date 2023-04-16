import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from 'src/models/company';
import { Submission } from 'src/models/submission';

@Injectable()
export class CompanyService {

    private readonly url = `/api/companies`;

    constructor(
        protected http: HttpClient,
    ) {}

    public getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(`${this.url}`)
    }

    public getCompany(name: string): Observable<Company> {
        return this.http.get<Company>(`${this.url}/${name}`)
    }

    public addCompany(name: string) {
        return this.http.post(`${this.url}`, { name: name });
    }

    public removeCompany(name: string) {
        return this.http.delete(`${this.url}/${name}`);
    }

    public setSubmissions(name: string, submissions: Submission[]) {
        return this.http.post(`${this.url}/${name}/submissions`, { submissions: submissions.map(s => s.adsh) })
    }
}

