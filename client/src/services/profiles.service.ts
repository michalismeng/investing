import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Profile } from 'src/models/profile';

@Injectable()
export class ProfilesService {

    private readonly url = `/api/profiles`;

    constructor(
        protected http: HttpClient,
    ) {}

    public getProfile(companyName: string): Observable<Profile> {
        return of(JSON.parse(localStorage.getItem(`profile-${companyName}`)!))
        return this.http.get<Profile>(`${this.url}/profiles/${companyName}`) 
    }

    public postProfile(companyName: string, profile: Profile) {
        console.log("posting...")
        localStorage.setItem(`profile-${companyName}`, JSON.stringify(profile))
        return this.http.post<Profile>(`${this.url}/profiles/${companyName}`, profile)
    }
}

