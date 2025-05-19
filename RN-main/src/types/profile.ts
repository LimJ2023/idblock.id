import { PROFILE_STATUS } from './enum';
import { City } from './city';

export interface Profile {
  id?: string;
  email?: string;
  name?: string;
  birthday?: string;
  city?: City;
  status?: PROFILE_STATUS;
  profileImage?: string;
  reason?: string;
}
