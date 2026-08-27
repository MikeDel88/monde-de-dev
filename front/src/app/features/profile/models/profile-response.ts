import {Topic} from "../../topic/models/topic";

export interface ProfileResponse {
  name: string;
  email: string;
  topics: Topic[]
}
