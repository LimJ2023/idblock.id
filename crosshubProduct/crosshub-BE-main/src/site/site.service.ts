import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { ERROR_CODE } from 'src/common/error-code';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import {
  Site,
  SiteManager,
  SiteVisit,
  SiteVisitReview,
} from 'src/database/schema';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class SiteService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
    private readonly s3Service: S3Service,
  ) {}

  async listSites() {
    return (
      await this.db.query.Site.findMany({
        orderBy: (table, { desc }) => desc(table.id),
      })
    ).map((s) => ({
      ...s,
      imageKey: this.s3Service.getPublicObjectUrl(s.imageKey),
    }));
  }
  async findOneSite(id: bigint) {
    const [target] = await this.db
      .select()
      .from(Site)
      .leftJoin(SiteManager, eq(Site.id, SiteManager.siteId))
      .where(eq(Site.id, id));
    return {
      ...target.site,
      imageKey: this.s3Service.getPublicObjectUrl(target?.site.imageKey!),
      siteManager: { ...target.site_manager, password: undefined },
    };
  }
  createSite(payload: typeof Site.$inferInsert) {
    return this.db
      .insert(Site)
      .values({
        ...payload,
      })
      .returning();
  }

  updateSite(id: bigint, payload: typeof Site.$inferInsert) {
    return this.db
      .update(Site)
      .set({
        ...payload,
      })
      .where(eq(Site.id, id))
      .returning();
  }

  deleteSite(id: bigint) {
    return this.db.delete(Site).where(eq(Site.id, id)).returning();
  }

  async listVisitHistory(userId: bigint) {
    const visits = await this.db
      .select()
      .from(SiteVisit)
      .leftJoin(Site, eq(Site.id, SiteVisit.siteId))
      .leftJoin(SiteVisitReview, eq(SiteVisit.id, SiteVisitReview.visitId))
      .where(eq(SiteVisit.userId, userId))
      .orderBy(desc(SiteVisit.id));

    return visits.map((visit) => ({
      ...visit.site_visit,
      site: visit.site ? this.formatSite(visit.site) : null,
      review: visit.site_visit_review,
    }));
  }

  private formatSite(site: typeof Site.$inferSelect) {
    return {
      ...site,
      imageUrl: this.s3Service.getPublicObjectUrl(site.imageKey),
    };
  }

  async createReview(visitId: bigint, content: string) {
    const isValidVisit = await this.db.query.SiteVisit.findFirst({
      where: (table, { eq }) => eq(table.id, visitId),
    });

    if (!isValidVisit) {
      throw new BadRequestException(ERROR_CODE.INVALID_VISIT_ID);
    }

    const [upserted] = await this.db
      .insert(SiteVisitReview)
      .values({
        visitId,
        content,
      })
      .onConflictDoUpdate({
        set: { content },
        target: SiteVisitReview.visitId,
      })
      .returning();

    return upserted;
  }
}
