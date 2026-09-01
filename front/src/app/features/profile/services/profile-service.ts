import {inject, Service} from '@angular/core';
import {HttpClient, httpResource, HttpResourceRef} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ProfileResponse} from "../models/profile-response";
import {Observable} from "rxjs";

@Service()
export class ProfileService {

  private httpClient = inject(HttpClient);

  profile: HttpResourceRef<ProfileResponse | undefined> = httpResource<ProfileResponse>(() => ({
    url: `${environment.apiUrl}/profile`,
  }));

  updateProfil$(email: string | null, name: string | null): Observable<ProfileResponse> {
    return this.httpClient.patch<ProfileResponse>(`${environment.apiUrl}/profile`, {
      email: email,
      name: name,
    });
  }

  updatePassword$(newPassword: string, currentPassword: string): Observable<void> {
    return this.httpClient.patch<void>(`${environment.apiUrl}/profile/password`, { newPassword, currentPassword });
  }
}
