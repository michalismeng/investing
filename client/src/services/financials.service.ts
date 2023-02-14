import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { FactRow } from 'src/models/fact';
import { Scheme } from 'src/models/scheme';

@Injectable()
export class FinancialsService {

    private readonly url = `/api/financials`;

    constructor(
        protected http: HttpClient,
    ) {}

    public getFacts(adsh: string[] = [], stmt: string = "IS"): Observable<{ initial: FactRow[], view: FactRow[] }> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append("stmt", stmt)
        queryParams = queryParams.append("view", "scheme")
        adsh.forEach(val => { queryParams = queryParams.append("adsh[]", val) })

        return this.http.get<{ initial: any, view: any }>(`${this.url}`, { params: queryParams })
                        .pipe(map(x => {
                            return {
                                initial: JSON.parse(x.initial) as FactRow[],
                                view: JSON.parse(x.view) as FactRow[]
                            }
            }))
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
