import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { User } from 'src/database/schema/user';
import { TLoginDto, TUpdateInfoDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import {
  City,
  Country,
  EmailVerification,
  UserApproval,
  UserVerificationDocument,
} from 'src/database/schema';
import { EmailService } from 'src/email/email.service';
import crypto from 'crypto';
import { addMinutes, subMinutes } from 'date-fns';
import { desc, eq } from 'drizzle-orm';
import { PostgresError } from 'postgres';
import { UserSession } from 'src/database/schema/user-session';
import { email } from 'valibot';
import { S3Service } from 'src/s3/s3.service';
import QRCode from 'qrcode';
import { ERROR_CODE } from 'src/common/error-code';
import { EnvService } from 'src/env/env.service';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { NotificationService } from 'src/notification/notification.service';
import { ArgosService } from 'src/argos/argos.service';
import { BaseAuthService } from './base-auth.service';

@Injectable()
export class AuthService extends BaseAuthService<
  typeof User.$inferSelect,
  typeof UserSession.$inferSelect,
  TLoginDto
> {
  constructor(
    @Inject(INJECT_DRIZZLE) db: DrizzleDB,
    jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
    private readonly envService: EnvService,
    private readonly thirdwebService: ThirdwebService,
    private readonly notificationService: NotificationService,
    private readonly argosService: ArgosService,
  ) {
    super(
      db,
      jwtService,
      'User',
      'UserSession', 
      User,
      UserSession,
      'userId',
      '1d', // accessToken 만료시간
      '1y', // refreshToken 만료시간
    );
  }

  protected convertUserId(userId: string | number | bigint): bigint {
    return BigInt(userId);
  }

  async signupWithTransaction(signupData: {
    email: string;
    name: string;
    birthday: string;
    passportNumber: string;
    passportImageKey: string;
    profileImageKey: string;
    cityId: string;
    countryCode: string;
  }) {
    return this.db.transaction(async (trx) => {
      // 1. 유저 ID 조회
      const user = await trx.query.User.findFirst({
        where: (table, { eq }) => eq(table.email, signupData.email),
      });
      
      if (!user) {
        console.log('user not found');
        throw new BadRequestException(ERROR_CODE.USER_NOT_FOUND);
      }

      console.log(`간편가입 사용자 전체가입 시작 - userId: ${user.id}, email: ${user.email}`);

      // 2. 기존 UserVerificationDocument 확인 및 정리
      const existingDocument = await trx.query.UserVerificationDocument.findFirst({
        where: (table, { eq }) => eq(table.userId, user.id),
      });

      if (existingDocument) {
        console.log(`기존 UserVerificationDocument 발견 - documentId: ${existingDocument.id}, status: ${existingDocument.approvalStatus}`);
        
        // 기존 문서가 이미 승인된 경우 처리
        if (existingDocument.approvalStatus === 1) {
          console.log('이미 승인된 문서가 존재합니다');
          return { userId: user.id, isAutoApproved: true, documentId: existingDocument.id };
        }
        
        // 기존 문서 삭제
        await trx.delete(UserVerificationDocument).where(eq(UserVerificationDocument.userId, user.id));
        console.log('기존 UserVerificationDocument 삭제 완료');
      }

      // 3. 새로운 UserVerificationDocument 생성
      const [document] = await trx
        .insert(UserVerificationDocument)
        .values({
          userId: user.id,
          passportImageKey: signupData.passportImageKey,
          profileImageKey: signupData.profileImageKey,
        })
        .returning({ id: UserVerificationDocument.id });

      console.log(`새로운 UserVerificationDocument 생성 - documentId: ${document.id}`);

      // 4. 사용자 정보 업데이트
      await trx
        .update(User)
        .set({
          name: signupData.name,
          birthday: signupData.birthday,
          passportNumber: signupData.passportNumber,
          cityId: signupData.cityId,
          countryCode: signupData.countryCode,
        })
        .where(eq(User.id, user.id));

      console.log('사용자 정보 업데이트 완료');

      // 5. 자동 승인 처리 (트랜잭션 내에서)
      let isAutoApproved = false;
      try {
        console.log('자동 승인 프로세스 시작...');
        isAutoApproved = await this.autoApproveUserInTransaction(document.id, trx);
        console.log(`자동 승인 프로세스 완료 - 결과: ${isAutoApproved}`);
      } catch (error) {
        console.error('자동 승인 처리 중 오류 발생:', error);
        if (error instanceof Error) {
          console.error('오류 스택:', error.stack);
        }
        // 자동 승인 실패해도 signup 자체는 성공으로 처리
        isAutoApproved = false;
      }

      return { userId: user.id, isAutoApproved, documentId: document.id };
    });
  }

  private async autoApproveUserInTransaction(documentId: bigint, trx: any): Promise<boolean> {
    console.log(`autoApproveUser documentId: ${documentId}`);

    try {
      // 얼굴 비교 수행
      console.log('얼굴 비교 프로세스 시작...');
      const verificationData = await this.argosService.argosProcessPipeline(documentId);
      console.log('얼굴 비교 프로세스 완료:', {
        matchSimilarity: verificationData.matchSimilarity,
        matchConfidence: verificationData.matchConfidence,
      });
      
      if (verificationData.matchSimilarity === null || verificationData.matchConfidence === null) {
        console.log('얼굴 비교 데이터가 null - Argos API 호출 실패 가능성');
        return false;
      }

      const similarity = Number(verificationData.matchSimilarity);
      const confidence = Number(verificationData.matchConfidence);
      
      if (similarity < 95 || confidence < 95) {
        console.log(`얼굴 비교 실패 - similarity: ${similarity}, confidence: ${confidence} (임계값: 95)`);
        return false;
      }

      console.log(`얼굴 비교 성공 - similarity: ${similarity}, confidence: ${confidence} - 자동 승인 처리 시작`);

      const userId = verificationData.userId;

      // approvalStatus 업데이트
      await trx
        .update(UserVerificationDocument)
        .set({ approvalStatus: 1 })
        .where(eq(UserVerificationDocument.id, documentId));

      const [{ id: approvalId }] = await trx
        .insert(UserApproval)
        .values({
          documentId,
          userId,
          approvedBy: 1,
        })
        .returning();

      console.log(`UserApproval 생성 완료 - approvalId: ${approvalId}`);

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

      console.log(`NFT 생성 완료 - txHash: ${txHash}`);

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

      console.log('자동 승인 처리 완료');
      return true;
    } catch (error) {
      console.error('자동 승인 처리 중 오류 발생:', error);
      if (error instanceof Error) {
        console.error('오류 스택:', error.stack);
      }
      throw error;
    }
  }

  private validateBirthday(dateString: string) {
    let year: number, month: number, day: number;

    // Check if the date string matches the format YYYYMMDD (8 digits)
    if (/^\d{8}$/.test(dateString)) {
      [year, month, day] = [
        dateString.substring(0, 4),
        dateString.substring(4, 6),
        dateString.substring(6, 8),
      ].map(Number);
    }
    // Check if the date string matches the format YYYY-MM-DD
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      [year, month, day] = dateString.split('-').map(Number);
    }
    // Invalid format
    else {
      return false;
    }

    const date = new Date(year, month - 1, day);

    // Check if the date is valid
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }
  async signupSimple(data: { email: string, password: string }) {
    const isAlreadyUserEmail = await this.checkIsUser(data.email);

    if (isAlreadyUserEmail) {
      throw new BadRequestException(ERROR_CODE.ALREADY_USED_EMAIL);
    }
    const [user] = await this.db
      .insert(User)
      .values({
        email: data.email,
        password: await this.hashPassword(data.password),
        name: 'guest',
        countryCode: 'TEMP_COUNTRY',
        birthday: null,
        passportNumber: 'TEMP_PASSPORT_NUMBER',
        approvalId: null,
        cityId: 'TEMP_CITY_ID',
      })
      .returning({
        id: User.id,
        email: User.email,
      });

    return user;
  }
  async signupVerifyStep1(data: { birthday: string, passportNumber: string, email: string }) {
    console.log('signupVerifyStep1 >>>>>>.', data);

    const isSamePerson = await this.db.query.User.findFirst( {
      where: (table, { eq, and }) => and(
        eq(table.passportNumber, data.passportNumber),
        eq(table.birthday, data.birthday),
        eq(table.email, data.email)
    )
    }) ? true : false;
    // 이미 가입된 사용자인 경우 바로 반환
    if(isSamePerson) {
      return data;
    }

    const isValidBirthday = this.validateBirthday(data.birthday);
    if (!isValidBirthday) {
      throw new BadRequestException(ERROR_CODE.INVALID_DATE_FORMAT);
    }
    const isAlreadyUsedPassport = await this.db.query.User.findFirst({
      where: (table, { eq }) => eq(table.passportNumber, data.passportNumber),
    });

    console.log('isAlreadyUsedPassport >>>>>>.', isAlreadyUsedPassport);

    if (isAlreadyUsedPassport) {
      throw new BadRequestException(ERROR_CODE.ALREADY_USED_PASSPORT_NUMBER);
    }
    return data;
  }

  async requestEmailVerification(email: string, resetPassword = false) {
    const isUser = await this.checkIsUser(email);
    if (!resetPassword && isUser) {
      throw new BadRequestException(ERROR_CODE.ALREADY_USED_EMAIL);
    }
    if (resetPassword && !isUser) {
      throw new BadRequestException(ERROR_CODE.USER_NOT_FOUND);
    }

    const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const [data] = await this.db
      .insert(EmailVerification)
      .values({
        email,
        code,
      })
      .returning({
        email: EmailVerification.email,
        uuid: EmailVerification.uuid,
        createdAt: EmailVerification.createdAt,
      });

    await this.emailService.sendEmail(data.email, code);

    return data;
  }

  async confirmEmailVerification(email: string, uuid: string, code: string) {
    const target = await this.db.query.EmailVerification.findFirst({
      where: (emailVerifications, { and, eq }) =>
        and(
          eq(emailVerifications.email, email),
          eq(emailVerifications.uuid, uuid),
          eq(emailVerifications.code, code),
        ),
      orderBy: (table, { desc }) => desc(table.createdAt),
    });

    if (!target) {
      throw new BadRequestException(ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND);
    }

    if (target.createdAt < subMinutes(new Date(), 3)) {
      throw new BadRequestException(ERROR_CODE.EMAIL_VERIFICATION_EXPIRED);
    }

    const [updated] = await this.db
      .update(EmailVerification)
      .set({ isVerified: true })
      .where(eq(EmailVerification.uuid, target.uuid))
      .returning();

    return updated;
  }

  async deleteEmailVerification(email: string) {
    await this.db
      .delete(EmailVerification)
      .where(eq(EmailVerification.email, email));
  }



  async emailVerificationCheck(uuid: string, email: string) {
    const found = await this.db.query.EmailVerification.findFirst({
      where: (table, { and, eq }) =>
        and(
          eq(table.uuid, uuid),
          eq(table.email, email),
          eq(table.isVerified, true),
        ),
    });

    if (!found) {
      throw new BadRequestException(ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND);
    }
    return true;
  }

  async createUserWithValidation(data: typeof User.$inferInsert) {
    const isAlreadyUsedEmail = await this.db.query.User.findFirst({
      where: (table, { eq }) => eq(table.email, data.email),
    });
    if (isAlreadyUsedEmail) {
      throw new BadRequestException(ERROR_CODE.ALREADY_USED_EMAIL);
    }
    return this.db
      .insert(User)
      .values({
        ...data,
        password: await this.hashPassword(data.password as string),
      })
      .returning({ id: User.id, email: User.email })
      .catch((e) => {
        if (e instanceof PostgresError) {
          console.error(e);
          if (e.routine === 'DateTimeParseError') {
            throw new BadRequestException(ERROR_CODE.INVALID_DATE_FORMAT);
          }
          throw new BadRequestException(ERROR_CODE.ALREADY_USED_EMAIL);
        }
      });
  }

  async updateUser(userId: bigint, data: TUpdateInfoDto) {
    return this.db.update(User).set(data).where(eq(User.id, userId));
  }

  async deleteUser(email: string) {
    return this.db.transaction(async (trx) => {
      // 먼저 이메일로 사용자 ID를 조회
      const user = await trx.query.User.findFirst({
        where: (table, { eq }) => eq(table.email, email),
      });

      if (!user) {
        throw new BadRequestException(ERROR_CODE.USER_NOT_FOUND);
      }

      const userId = user.id;

      // UserApproval 레코드 삭제 (UserVerificationDocument를 참조하는 경우)
      const userApprovals = await trx.query.UserApproval.findMany({
        where: (table, { eq }) => eq(table.userId, userId),
      });

      if (userApprovals.length > 0) {
        await trx.delete(UserApproval).where(eq(UserApproval.userId, userId));
      }

      // UserVerificationDocument 레코드들 삭제
      await trx.delete(UserVerificationDocument).where(eq(UserVerificationDocument.userId, userId));

      // 마지막으로 User 레코드 삭제
      return trx.delete(User).where(eq(User.email, email));
    });
  }

  async createUserVerificationDocument(
    userId: bigint,
    passportImageKey: string,
    profileImageKey: string,
  ) {
    const user = await this.db.query.UserVerificationDocument.findFirst({
      where: (table, { eq }) => eq(table.userId, userId),
    })
    if(user) {
      await this.db.delete(UserVerificationDocument).where(eq(UserVerificationDocument.userId, userId));
    }
    
    return this.db
      .insert(UserVerificationDocument)
      .values({
        userId,
        passportImageKey,
        profileImageKey,
      })
      .returning({ id: UserVerificationDocument.id });
  }

  async getUserId(email: string) {
    const user = await this.db.query.User.findFirst({
      where: (table, { eq }) => eq(table.email, email),
    });
    return user?.id;
  }
  async getProfile(userId: bigint) {
    const user = await this.db.query.User.findFirst({
      where: (table, { eq }) => eq(table.id, userId),
      with: {
        city: true,
        approval: {
          with: {
            document: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException(ERROR_CODE.USER_NOT_FOUND);
    }

    const latestDocument =
      await this.db.query.UserVerificationDocument.findFirst({
        where: (table, { eq }) => eq(table.userId, user.id),
        orderBy: (table, { desc }) => desc(table.id),
      });

    console.log('latestDocument >>>>>>.', latestDocument);
      // 이메일만 적은 간편가입 사용자는 아이디와 이메일만 반환
    if(user.approvalId === null && latestDocument === undefined) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    }

    // S3 키가 null인 경우 처리
    const getProfileImageUrl = async (imageKey: string | null | undefined) => {
      if (!imageKey) {
        return null;
      }
      try {
        return await this.s3Service.createPresignedUrlWithClient(imageKey);
      } catch (error) {
        console.error('S3 presigned URL 생성 실패:', error);
        return null;
      }
    };

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      city: {
        id: user.city?.id,
        name: user.city?.name,
        country: user.city?.country,
        coutryCode: user.city?.countryCode,
      },
      ...(user.approvalId !== null ?
        {
          status: 'APPROVED',
          profileImage: await getProfileImageUrl(user.approval?.document?.profileImageKey),
        }
      : latestDocument?.approvalStatus === 2 ?
        {
          status: 'REJECTED',
          reason: latestDocument?.rejectReason,
          profileImage: await getProfileImageUrl(latestDocument?.profileImageKey),
        }
      : {
          status: 'PENDING',
          profileImage: await getProfileImageUrl(latestDocument?.profileImageKey),
        }),
    };
  }

  async getQrCode(userId: bigint) {
    return QRCode.toDataURL(
      JSON.stringify({ userId, expiresAt: addMinutes(new Date(), 1) }),
    );
  }

  async getQrCodeBuffer(userId: bigint): Promise<Buffer> {
    const qrData = JSON.stringify({
      userId,
      expiresAt: addMinutes(new Date(), 1),
    });
    return await QRCode.toBuffer(qrData, { type: 'png' });
  }

  async resetPassword(uuid: string, password: string) {
    const target = await this.db.query.EmailVerification.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.uuid, uuid), eq(table.isVerified, true)),
    });

    if (!target) {
      throw new BadRequestException(ERROR_CODE.EMAIL_VERIFICATION_NOT_FOUND);
    }
    if (target.createdAt < subMinutes(new Date(), 3)) {
      throw new BadRequestException(ERROR_CODE.EMAIL_VERIFICATION_EXPIRED);
    }

    const [updated] = await this.db
      .update(User)
      .set({ password: await this.hashPassword(password as string) })
      .where(eq(User.email, target.email))
      .returning({ id: User.id });

    return updated;
  }



  private async checkIsUser(email: string) {
    return Boolean(
      await this.db.query.User.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      }),
    );
  }

  async argosRecognition(file: Express.Multer.File) {
    return this.argosService.recognitionFromFile(file);
  }

  async argosFaceCompare(originFaceKey: string, targetFaceKey: string) {
    return this.argosService.faceCompare(originFaceKey, targetFaceKey);
  }

  async autoApproveUser(documentId: bigint): Promise<boolean> {
    console.log(`autoApproveUser documentId: ${documentId}`);

    try {
      // 얼굴 비교 수행
      const verificationData = await this.argosService.argosProcessPipeline(documentId);
      
      if (verificationData.matchSimilarity === null || verificationData.matchConfidence === null || 
        Number(verificationData.matchSimilarity) < 95 || Number(verificationData.matchConfidence) < 95) {
        console.log('얼굴 비교 실패 - 자동 승인하지 않음');
        return false;
      }

      console.log('얼굴 비교 성공 - 자동 승인 처리 시작');

      await this.db.transaction(async (trx) => {

        const userId = verificationData.userId;

        // approvalStatus 업데이트
        await trx
          .update(UserVerificationDocument)
          .set({ approvalStatus: 1 })
          .where(eq(UserVerificationDocument.id, documentId));

        const [{ id: approvalId }] = await trx
          .insert(UserApproval)
          .values({
            documentId,
            userId,
            approvedBy: 1,
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

      console.log('자동 승인 처리 완료');
      return true;
    } catch (error) {
      console.error('자동 승인 처리 중 오류 발생:', error);
      return false;
    }
  }

  async getUserCountry(code_3: string) {

    const country = await this.db.query.Country.findFirst({
      where: eq(Country.code_3, code_3),
    })
    if(!country) {
      throw new BadRequestException(ERROR_CODE.INVALID_COUNTRY_CODE);
    }
    return country;
  }
  async getUserCity(countryCode: string) {
    return this.db.query.City.findMany({
      where: eq(City.countryCode, countryCode),
    })
  }
}

