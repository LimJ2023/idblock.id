import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import {
  City,
  Country,
  Site,
  SiteManager,
  SiteVisit,
  User,
  UserApproval,
  UserVerificationDocument,
} from 'src/database/schema';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class VisitorService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
    private readonly s3Service: S3Service,
  ) {}

  async getVisitor(managerId: bigint) {
    const result = await this.db
      .select()
      .from(SiteVisit)
      .leftJoin(User, eq(SiteVisit.userId, User.id))
      .leftJoin(Site, eq(SiteVisit.siteId, Site.id))
      .leftJoin(SiteManager, eq(Site.id, SiteManager.siteId))
      .leftJoin(Country, eq(User.countryCode, Country.code))
      .leftJoin(City, eq(User.cityId, City.id))
      .where(eq(SiteManager.id, managerId))
      .orderBy(desc(SiteVisit.createdAt));

    return result.map((r) => {
      const { password, ...rest } = r.user!;
      return {
        ...r.site_visit,
        user: { ...rest, countryCode: r.country?.name, cityId: r.city?.name },
      };
    });
  }

  async getVisitorById(userId: bigint) {
    const [target] = await this.db
      .select()
      .from(User)
      .leftJoin(UserApproval, eq(User.approvalId, UserApproval.id))
      .leftJoin(
        UserVerificationDocument,
        eq(UserApproval.documentId, UserVerificationDocument.id),
      )
      .leftJoin(Country, eq(User.countryCode, Country.code))
      .leftJoin(City, eq(User.cityId, City.id))
      .where(eq(User.id, userId));

    if (!target) {
      throw new NotFoundException();
    }
    if (!target.user_approval || !target.user_verification_document) {
      throw new BadRequestException('Not approved user');
    }

    const { password, ...rest } = target.user;

    return {
      ...rest,
      profileImageKey: await this.s3Service.createPresignedUrlWithClient(
        target.user_verification_document?.profileImageKey ?? '',
      ),
      countryCode: target.country?.name,
      cityId: target.city?.name,
      txHash: target.user_approval.txHash,
    };
  }

  async createVisit(visitorId: bigint, managerId: bigint) {
    const siteManager = await this.db.query.SiteManager.findFirst({
      where: (t, { eq }) => eq(t.id, managerId),
    });
    if (!siteManager) {
      throw new NotFoundException();
    }

    return this.db
      .insert(SiteVisit)
      .values({
        userId: visitorId,
        siteId: siteManager.id,
      })
      .returning();
  }
}
