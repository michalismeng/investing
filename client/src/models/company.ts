import { Profile } from "./profile";

export interface Company {
  name: string,
  profiles?: Profile[],
  submissions?: string[],
  schemes?: { stmt: string, value: string },
}
