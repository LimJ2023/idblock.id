import { Review } from './review';
import { Site } from './site';

export interface Visit {
  id?: string;
  userId?: string;
  siteId?: string;
  createdAt?: string;
  review?: Review;
  site?: Site;
}
