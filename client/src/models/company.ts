import { Profile } from "./profile";

export interface Company {
  name: string,
  profiles?: Profile[],
}
