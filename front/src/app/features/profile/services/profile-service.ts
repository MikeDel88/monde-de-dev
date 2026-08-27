import { Service } from '@angular/core';
import {httpResource, HttpResourceRef} from "@angular/common/http";
import {environment} from "../../../../environments/environment";
import {ProfileResponse} from "../models/profile-response";

@Service()
export class ProfileService {
  profile: HttpResourceRef<ProfileResponse | undefined> = httpResource<ProfileResponse>(() => ({
    url: `${environment.apiUrl}/profile`,
  }));
}
