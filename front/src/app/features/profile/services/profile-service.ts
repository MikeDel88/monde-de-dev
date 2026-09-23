import {inject, Service} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ProfileResponse} from "../models/profile-response";
import {Observable} from "rxjs";

@Service()
export class ProfileService {

  private readonly httpClient = inject(HttpClient);
  readonly path = `${environment.apiUrl}/profile`;

  /**
   * Met à jour le profil de l'utilisateur connecté. Pour `email`, `name` et `password`,
   * `null` signifie "ne pas modifier ce champ" (et non "le vider") : seuls les champs
   * non-`null` sont pris en compte côté backend.
   * @param email Email de l'utilisateur
   * @param name Nom de l'utilisateur
   * @param password Mot de passe à changer
   * @param currentPassword Mot de passe actuel, requis pour confirmer toute modification.
   */
  updateProfile$(email: string | null, name: string | null, password: string | null, currentPassword: string): Observable<ProfileResponse> {
    return this.httpClient.patch<ProfileResponse>(this.path, {email, name, password, currentPassword});
  }
}
