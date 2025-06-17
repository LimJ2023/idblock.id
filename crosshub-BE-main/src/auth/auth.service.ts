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
import axios from 'axios';
import sharp from 'sharp';
import { EnvService } from 'src/env/env.service';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { NotificationService } from 'src/notification/notification.service';
@Injectable()
export class AuthService {
  constructor(
    @Inject(INJECT_DRIZZLE) private db: DrizzleDB,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
    private readonly envService: EnvService,
    private readonly thirdwebService: ThirdwebService,
    private readonly notificationService: NotificationService,
  ) {}

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
  async signupSimple(data: { email: string; password: string }) {
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
  async signupVerifyStep1(data: { birthday: string; passportNumber: string }) {
    console.log('signupVerifyStep1 >>>>>>.', data);
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

  async login(body: TLoginDto) {
    const target = await this.db.query.User.findFirst({
      where: (users, { eq }) => eq(users.email, body.email),
    });

    if (!target) {
      throw new BadRequestException(ERROR_CODE.INVALID_LOGIN_DATA);
    }

    const isPasswordValid = await verify(
      target.password as string,
      body.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException(ERROR_CODE.INVALID_LOGIN_DATA);
    }

    const userId = (target as typeof User.$inferSelect).id;

    return {
      ...this.createAccessToken(target.email, userId),
      userId,
    };
  }

  async createSession(userId: bigint, refreshToken: string) {
    return this.db
      .insert(UserSession)
      .values({ userId, refreshToken })
      .onConflictDoUpdate({
        target: UserSession.userId,
        set: { refreshToken, updatedAt: new Date() },
      })
      .returning({ id: UserSession.id });
  }

  async deleteSession(userId: string) {
    this.db.delete(UserSession).where(eq(UserSession.userId, BigInt(userId)));
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

  async createUser(data: typeof User.$inferInsert) {
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
          profileImage: await this.s3Service.createPresignedUrlWithClient(
            user.approval.document?.profileImageKey as string,
          ),
        }
      : latestDocument?.approvalStatus === 2 ?
        {
          status: 'REJECTED',
          reason: latestDocument?.rejectReason,
          profileImage: await this.s3Service.createPresignedUrlWithClient(
            latestDocument?.profileImageKey as string,
          ),
        }
      : {
          status: 'PENDING',
          profileImage: await this.s3Service.createPresignedUrlWithClient(
            latestDocument?.profileImageKey as string,
          ),
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

  async refeshAccessToken(refreshToken: string) {
    const target = await this.db.query.UserSession.findFirst({
      where: (table, { eq }) => eq(table.refreshToken, refreshToken),
    });

    const verified = await this.validateRefreshToken(refreshToken);

    if (!target || !verified) {
      throw new UnauthorizedException(ERROR_CODE.INVALID_REFRESH_TOKEN);
    }

    const userId = (target as typeof UserSession.$inferSelect).userId;

    return {
      ...this.createAccessToken(
        (
          await this.db.query.User.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
          })
        )?.email as string,
        userId,
      ),
      userId,
    };
  }

  private async validateRefreshToken(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException(ERROR_CODE.INVALID_REFRESH_TOKEN);
    }
    try {
      const verified = await this.jwtService.verifyAsync(refreshToken);
      console.log(verified);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  private hashPassword(password: string) {
    return hash(password, {
      // recommended minimum parameters
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
  }

  private createAccessToken(email: string, userId: bigint) {
    return {
      accessToken: this.jwtService.sign(
        { sub: email, user_id: userId.toString() },
        { expiresIn: '1d' },
      ),
      refreshToken: this.jwtService.sign(
        { sub: email, user_id: userId.toString() },
        { expiresIn: '1y' },
      ),
    };
  }

  private async checkIsUser(email: string) {
    return Boolean(
      await this.db.query.User.findFirst({
        where: (users, { eq }) => eq(users.email, email),
      }),
    );
  }

  private async fetchImageAsBase64(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000, // 10초 타임아웃 설정
      });
      const inputBuffer = Buffer.from(response.data, 'binary');
      const maxSizeKB = 5000;

      let outputBuffer: Buffer = Buffer.from('');

      // Reduce quality until under max size or quality is too low
      for (let quality = 90; quality > 10; quality -= 10) {
        outputBuffer = await sharp(inputBuffer).jpeg({ quality }).toBuffer();

        if (outputBuffer.length / 1024 <= maxSizeKB) {
          break;
        }
      }
      const base64 = outputBuffer.toString('base64');
      return `${base64}`;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new BadRequestException('Failed to fetch image from S3');
    }
  }
  async argosRecognition(file: Express.Multer.File) {
    const fileUrl = await this.s3Service.uploadFile(file, 'public/passport/');
    const idImageBase64 = await this.fetchImageAsBase64(fileUrl.url);
    try {
      const response = await axios.post<RecognitionResponse>(
        'https://idverify-api.argosidentity.com/modules/recognition',
        {
          idImage: idImageBase64,
          issuingCountry: 'KOR',
          idType: 'passport',
        },
        {
          headers: {
            'x-api-key': this.envService.get('ARGOS_API_KEY'),
          },
        },
      );

      // console.log('recognition raw data >>>>>>.', JSON.stringify(response.data.result.data.raw, null, 2));
      console.log(
        'recognition ocr data >>>>>>.',
        JSON.stringify(response.data.result.data, null, 2),
      );
      const ocrData = response.data.result.data.ocr;
      return ocrData;
    } catch (error) {
      console.error('Error fetching Argos Recognition:', error);
      throw new BadRequestException('Failed to fetch Argos Recognition');
    }
  }

  async argosFaceCompare(originFaceKey: string, targetFaceKey: string) {
    try {
      // S3 키에서 presigned URL 생성
      const originFaceUrl =
        await this.s3Service.createPresignedUrlWithClient(originFaceKey);
      const targetFaceUrl =
        await this.s3Service.createPresignedUrlWithClient(targetFaceKey);

      // URL에서 이미지를 가져와서 base64로 변환
      const originFaceBase64 = await this.fetchImageAsBase64(originFaceUrl);
      const targetFaceBase64 = await this.fetchImageAsBase64(targetFaceUrl);

      const response = await axios.post<FaceCompareResponse>(
        'https://idverify-api.argosidentity.com/modules/compare',
        {
          originFace: originFaceBase64,
          targetFace: targetFaceBase64,
        },
        {
          headers: {
            'x-api-key': this.envService.get('ARGOS_API_KEY'),
          },
        },
      );

      const similarity = response.data.result.faceMatch.similarity;
      const confidence = response.data.result.faceMatch.confidence;

      console.log(`user similarity: ${similarity}, confidence: ${confidence}`);
      if (similarity >= 95 && confidence >= 95) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching Argos Face Compare:', error);
      return false;
      // throw new BadRequestException('Failed to fetch Argos Face Compare');
    }
  }

  async autoApproveUser(documentId: bigint) {
    console.log(`autoApproveUser documentId: ${documentId}`);

    return this.db.transaction(async (trx) => {
      // 먼저 UserVerificationDocument에서 userId를 조회
      const document = await trx.query.UserVerificationDocument.findFirst({
        where: (table, { eq }) => eq(table.id, documentId),
      });

      if (!document) {
        throw new BadRequestException('Document not found');
      }

      const userId = document.userId;

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
  }
}
export interface IdLivenessResponse {
  apiType: string;
  transactionId: string;
  result: {
    screenReplay: LivenessScore;
    paperPrinted: LivenessScore;
    replacePortraits: LivenessScore;
  };
}

export interface FaceCompareResponse {
  apiType: string;
  transactionId: string;
  result: {
    face: Face;
    faceMatch: FaceMatch;
  };
}

export interface RecognitionResponse {
  apiType: string;
  transactionId: string;
  result: any;
}

export interface FaceLivenessResponse {
  apiType: string;
  transactionId: string;
  result: LivenessScore;
}
interface LivenessScore {
  liveness_score: number;
}
interface Face {
  isAvailable: boolean;
  boundingBox: BoundingBox;
}

interface FaceMatch {
  isAvailable: boolean;
  boundingBox: BoundingBox;
  similarity: number;
  confidence: number;
  landmarks: Landmark[];
  pose: Pose;
  quality: Quality;
}
interface BoundingBox {
  Width: number;
  Height: number;
  Left: number;
  Top: number;
}
interface Landmark {
  Type: string;
  X: number;
  Y: number;
}

interface Pose {
  Roll: number;
  Yaw: number;
  Pitch: number;
}

interface Quality {
  Brightness: number;
  Sharpness: number;
}
