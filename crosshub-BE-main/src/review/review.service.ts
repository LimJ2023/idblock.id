import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import {
  City,
  Country,
  SiteManager,
  SiteVisit,
  SiteVisitReview,
  User,
} from 'src/database/schema';

@Injectable()
export class ReviewService {
  constructor(@Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB) {}

  async getReview(managerId: bigint) {
    const result = await this.db
      .select()
      .from(SiteVisitReview)
      .leftJoin(SiteVisit, eq(SiteVisitReview.visitId, SiteVisit.id))
      .leftJoin(User, eq(User.id, SiteVisit.userId))
      .leftJoin(SiteManager, eq(SiteVisit.siteId, SiteManager.siteId))
      .leftJoin(Country, eq(User.countryCode, Country.code))
      .leftJoin(City, eq(User.cityId, City.id))
      .where(eq(SiteManager.id, managerId));

    return result.map((r) => {
      const { password, ...rest } = r.user!;
      return {
        ...r.site_visit_review,
        visit: r.site_visit,
        user: { ...rest, countryCode: r.country?.name, cityId: r.city?.name },
      };
    });
  }
}
