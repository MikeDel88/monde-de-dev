import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ProfileResponse} from "../models/profile-response";
import {Observable} from "rxjs";

@Service()
export class ProfileService {

  private httpClient = inject(HttpClient);
  readonly path = `${environment.apiUrl}/profile`;

  updateProfile$(email: string | null, name: string | null, password: string | null, currentPassword: string): Observable<ProfileResponse> {
    return this.httpClient.patch<ProfileResponse>(this.path, {email, name, password, currentPassword});
  }
}
