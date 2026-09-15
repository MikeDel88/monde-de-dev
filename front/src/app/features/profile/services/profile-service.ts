import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ProfileResponse} from "../models/profile-response";
import {Observable} from "rxjs";

@Service()
export class ProfileService {

  private httpClient = inject(HttpClient);
  readonly path = `${environment.apiUrl}/profile`;

  updateProfile$(email: string | null, name: string | null): Observable<ProfileResponse> {
    return this.httpClient.patch<ProfileResponse>(this.path, {
      email: email,
      name: name,
    });
  }

  updatePassword$(newPassword: string, currentPassword: string): Observable<void> {
    return this.httpClient.patch<void>(`${this.path}/password`, { newPassword, currentPassword });
  }
}
