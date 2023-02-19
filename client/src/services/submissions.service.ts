import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Submission } from 'src/models/submission';

@Injectable()
export class SubmissionsService {

    private readonly url = `/api/submissions`;

    constructor(
        protected http: HttpClient) {}

    public getSubmissions(name: string = "", form: string = ""): Observable<Submission[]> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append("name", name);
        queryParams = queryParams.append("form", form);
        
        return this.http.get<Submission[]>(this.url, { params: queryParams });
    }

    public fromAdsh(adsh: string[]): Observable<Submission[]> {
        return this.http.post<Submission[]>(`${this.url}/from-adsh`, { adsh: adsh })
    }
}
