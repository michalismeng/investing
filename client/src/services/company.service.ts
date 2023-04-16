import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from 'src/models/company';

@Injectable()
export class CompanyService {

    private readonly url = `/api/companies`;

    constructor(
        protected http: HttpClient,
    ) {}

    public getCompanies(): Observable<Company[]> {
        return this.http.get<Company[]>(`${this.url}`)
    }

    public addCompany(name: string) {
        return this.http.post(`${this.url}`, { name: name });
    }

    public removeCompany(name: string) {
        return this.http.delete(`${this.url}/${name}`);
    }
}

