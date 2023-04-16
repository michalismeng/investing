import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Profile } from 'src/models/profile';

@Injectable()
export class ProfilesService {

    private readonly url = `/api/analysis`;

    constructor(
        protected http: HttpClient,
    ) {}

    public getProfile(companyName: string): Observable<Profile> {
        return this.http.get<Profile[]>(`${this.url}//${companyName}/profile`).pipe(map(v => v[0]))
    }

    public postProfile(companyName: string, profile: Profile) {
        return this.http.post<Profile>(`${this.url}/${companyName}/profile`, profile)
    }
}

