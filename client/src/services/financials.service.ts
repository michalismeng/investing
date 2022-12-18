import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FactRow } from 'src/models/fact';
import { Scheme } from 'src/models/scheme';

@Injectable()
export class FinancialsService {

    private readonly url = `/api/financials`;

    constructor(
        protected http: HttpClient,
    ) {}

    public getFacts(adsh: string[] = [], stmt: string = "IS"): Observable<FactRow[]> {
        return this.http.post<FactRow[]>(`${this.url}`, { "adsh": adsh, "stmt": stmt })
    }

    public getScheme(name: string, stmt: string): Observable<Scheme> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append("name", name);
        queryParams = queryParams.append("stmt", stmt);

        return this.http.get<Scheme>(`${this.url}/schemes`, { params: queryParams })
    }

    public addScheme(scheme: Scheme) {

        return this.http.post(`${this.url}/schemes`, scheme)
    }
}
