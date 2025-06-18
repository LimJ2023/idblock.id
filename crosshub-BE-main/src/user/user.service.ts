import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import {
  City,
  Country,
  User,
  UserApproval,
  UserVerificationDocument,
} from 'src/database/schema';
import { TUserStatus } from './admin.user.dto';
import { S3Service } from 'src/s3/s3.service';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { NotificationService } from 'src/notification/notification.service';
import { EnvService } from 'src/env/env.service';
import { ArgosService } from 'src/argos/argos.service';



@Injectable()
export class UserService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
    private readonly s3Service: S3Service,
    private readonly thirdwebService: ThirdwebService,
    private readonly notificationService: NotificationService,
    private readonly envService: EnvService,
    private readonly argosService: ArgosService,
  ) {}

  async getUserVerificationDocument(documentId: bigint) {
    const [u] = await this.db
      .select()
      .from(UserVerificationDocument)
      .leftJoin(User, eq(UserVerificationDocument.userId, User.id))
      .leftJoin(
        UserApproval,
        eq(UserApproval.documentId, UserVerificationDocument.id),
      )
      .leftJoin(Country, eq(User.countryCode, Country.code))
      .leftJoin(City, eq(User.cityId, City.id))
      .where(eq(UserVerificationDocument.id, documentId))
      .orderBy(desc(UserVerificationDocument.id));

    return {
      ...u.user,
      ...u.user_approval,
      ...u.user_verification_document,
      countryCode: u.country?.name,
      cityId: u.city?.name,
      passportImageKey: await this.s3Service.createPresignedUrlWithClient(
        u.user_verification_document?.passportImageKey ?? '',
      ),
      profileImageKey: await this.s3Service.createPresignedUrlWithClient(
        u.user_verification_document?.profileImageKey ?? '',
      ),
      documentId,
    };
  }

  async listUsers(status: TUserStatus) {
    let approvalStatus: number | undefined;
    if (status === 'APPROVED') approvalStatus = 1;
    else if (status === 'OPENED') approvalStatus = 0;
    else if (status === 'REJECTED') approvalStatus = 2;

    if (approvalStatus !== undefined) {
      return Promise.all(
        (
          await this.db
            .select()
            .from(UserVerificationDocument)
            .leftJoin(User, eq(UserVerificationDocument.userId, User.id))
            .leftJoin(Country, eq(User.countryCode, Country.code))
            .leftJoin(City, eq(User.cityId, City.id))
            .where(eq(UserVerificationDocument.approvalStatus, approvalStatus))
            .orderBy(desc(UserVerificationDocument.id))
        ).map(async (u) => ({
          ...u.user,
          ...u.user_verification_document,
          countryCode: u.country?.name,
          cityId: u.city?.name,
          password: undefined,
          id: u.user_verification_document.id,
          passportImageKey: await this.s3Service.createPresignedUrlWithClient(
            u.user_verification_document.passportImageKey,
          ),
          profileImageKey: await this.s3Service.createPresignedUrlWithClient(
            u.user_verification_document.profileImageKey,
          ),
        })),
      );
    } else {
      return this.db.query.User.findMany({});
    }
  }

  listDocuments() {
    return this.db.query.UserVerificationDocument.findMany();
  }

  listApprovedDocuments() {
    return this.db.query.UserApproval.findMany();
  }

  async approveUser(documentId: bigint, adminUserId: number) {
    return this.db.transaction(async (trx) => {
      const [{ userId }] = await trx
        .update(UserVerificationDocument)
        .set({ approvalStatus: 1 })
        .where(eq(UserVerificationDocument.id, documentId))
        .returning();

      const [{ id: approvalId }] = await trx
        .insert(UserApproval)
        .values({
          documentId,
          userId,
          approvedBy: adminUserId,
        })
        .returning();

      const txHash = await this.thirdwebService.generateNFT([
        {
          trait_trpe: 'userId',
          value: userId.toString(),
        },
        {
          trait_trpe: 'approvalId',
          value: approvalId,
        },
      ]);

      await trx.update(User).set({ approvalId }).where(eq(User.id, userId));

      await this.notificationService.sendNotification({
        userId,
        title: 'The Mobile ID registration was successful',
        content: 'Confirm your Mobile ID now',
      });
      await trx
        .update(UserApproval)
        .set({
          txHash,
        })
        .where(eq(UserApproval.id, approvalId));
    });
  }

  async declineUser(documentId: bigint, rejectReason: string) {
    const target = await this.db.query.UserVerificationDocument.findFirst({
      where: (t, { eq }) => eq(t.id, documentId),
    });

    if (!target) {
      throw new BadRequestException();
    }
    await this.notificationService.sendNotification({
      userId: target.userId,
      title: 'The Mobile ID registration was unsuccessful',
      content: rejectReason,
    });
    return this.db
      .update(UserVerificationDocument)
      .set({ approvalStatus: 2, rejectReason })
      .where(eq(UserVerificationDocument.id, documentId));
  }

  async deleteUser(documentId: bigint) {
    // return this.db
    //   .update(UserVerificationDocument)
    //   .set({ approvalStatus: 3 })
    //   .where(eq(UserVerificationDocument.id, documentId));

    return this.db.transaction(async (trx) => {
      // 1. 해당 문서 찾기
      const target = await trx.query.UserVerificationDocument.findFirst({
        where: (t, { eq }) => eq(t.id, documentId),
      });

      if (!target) {
        throw new BadRequestException('해당 문서를 찾을 수 없습니다.');
      }

      // 2. 해당 유저 찾기
      const targetUser = await trx.query.User.findFirst({
        where: (t, { eq }) => eq(t.id, target.userId),
      });

      if (!targetUser) {
        throw new BadRequestException('해당 유저를 찾을 수 없습니다.');
      }

      // 유저의 UserApproval 레코드 삭제
      const userApprovals = await trx.query.UserApproval.findMany({
        where: (table, { eq }) => eq(table.userId, target.userId),
      });

      if (userApprovals.length > 0) {
        await trx.delete(UserApproval).where(eq(UserApproval.userId, target.userId));
      }
      // 3. 문서 삭제
      await trx
        .delete(UserVerificationDocument)
        .where(eq(UserVerificationDocument.id, documentId));

      // 4. 유저 삭제
      await trx.delete(User).where(eq(User.id, target.userId));

      return { success: true };
    });
  }
}
