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
import axios from 'axios';
import { EnvService } from 'src/env/env.service';
import sharp from 'sharp';

interface LivenessScore {
  liveness_score: number;
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

@Injectable()
export class UserService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
    private readonly s3Service: S3Service,
    private readonly thirdwebService: ThirdwebService,
    private readonly notificationService: NotificationService,
    private readonly envService: EnvService,
  ) {}
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

  async argosRecognition(idImage: string) {
    const idImageBase64 = await this.fetchImageAsBase64(idImage);
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

      console.log(
        'recognition raw data >>>>>>.',
        JSON.stringify(response.data.result.data.raw, null, 2),
      );
      console.log(
        'recognition ocr data >>>>>>.',
        JSON.stringify(response.data.result.data.ocr, null, 2),
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Recognition:', error);
      throw new BadRequestException('Failed to fetch Argos Recognition');
    }
  }

  private async argosIdLiveness(documentId: bigint, idImage: string) {
    try {
      const response = await axios.post<IdLivenessResponse>(
        'https://idverify-api.argosidentity.com/modules/document',
        {
          idImage,
          pipelines: {
            sr: true,
            pc: true,
            ps: true,
          },
        },
        {
          headers: {
            'x-api-key': this.envService.get('ARGOS_API_KEY'),
          },
        },
      );

      await this.db
        .update(UserVerificationDocument)
        .set({
          screenReplay: response.data.result.screenReplay.liveness_score,
          paperPrinted: response.data.result.paperPrinted.liveness_score,
          replacePortraits:
            response.data.result.replacePortraits.liveness_score,
        })
        .where(eq(UserVerificationDocument.id, documentId));

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos ID Liveness:', error);
      throw new BadRequestException('Failed to fetch Argos ID Liveness');
    }
  }
  private async argosFaceCompare(
    documentId: bigint,
    originFace: string,
    targetFace: string,
  ) {
    try {
      const response = await axios.post<FaceCompareResponse>(
        'https://idverify-api.argosidentity.com/modules/compare',
        {
          originFace,
          targetFace,
        },
        {
          headers: {
            'x-api-key': this.envService.get('ARGOS_API_KEY'),
          },
        },
      );

      await this.db
        .update(UserVerificationDocument)
        .set({
          matchSimilarity: response.data.result.faceMatch.similarity.toString(),
          matchConfidence: response.data.result.faceMatch.confidence.toString(),
        })
        .where(eq(UserVerificationDocument.id, documentId));

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Face Compare:', error);
      throw new BadRequestException('Failed to fetch Argos Face Compare');
    }
  }

  private async argosFaceLiveness(documentId: bigint, faceImage: string) {
    try {
      const response = await axios.post<FaceLivenessResponse>(
        'https://idverify-api.argosidentity.com/modules/liveness',
        {
          faceImage,
        },
        {
          headers: {
            'x-api-key': this.envService.get('ARGOS_API_KEY'),
          },
        },
      );

      await this.db
        .update(UserVerificationDocument)
        .set({
          faceLiveness: response.data.result.liveness_score,
        })
        .where(eq(UserVerificationDocument.id, documentId));
      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Face Liveness:', error);
      throw new BadRequestException('Failed to fetch Argos Face Liveness');
    }
  }

  async argosProcessPipeline(documentId: bigint) {
    const [target] = await this.db
      .select()
      .from(UserVerificationDocument)
      .where(eq(UserVerificationDocument.id, documentId))
      .orderBy(desc(UserVerificationDocument.id));

    const idImageUrl = await this.s3Service.createPresignedUrlWithClient(
      target.passportImageKey,
    );
    const faceImageUrl = await this.s3Service.createPresignedUrlWithClient(
      target.profileImageKey,
    );
    const idImageBase64 = await this.fetchImageAsBase64(idImageUrl);
    const faceImageBase64 = await this.fetchImageAsBase64(faceImageUrl);

    try {
      const data = await this.argosIdLiveness(documentId, idImageBase64);
      console.log('id >>>>>>.', data);
    } catch (error) {}

    try {
      const faceData = await this.argosFaceLiveness(
        documentId,
        faceImageBase64,
      );
      console.log('face >>>>>>.', faceData);
    } catch (error) {}

    try {
      const compareData = await this.argosFaceCompare(
        documentId,
        idImageBase64,
        faceImageBase64,
      );
      console.log('compare >>>>>>.', compareData);
    } catch (error) {}

    return target;
  }

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

    // 1. 문서 조회
    const target = await this.db.query.UserVerificationDocument.findFirst({
      where: (t, { eq }) => eq(t.id, documentId),
    });
    if (!target) {
      throw new BadRequestException('해당 문서를 찾을 수 없습니다.');
    }

    // 2. 문서에 연결된 유저 조회
    const targetUser = await this.db.query.User.findFirst({
      where: (t, { eq }) => eq(t.id, target.userId),
    });
    if (!targetUser) {
      throw new BadRequestException('해당 유저를 찾을 수 없습니다.');
    }

    // 3. 유저 삭제
    return this.db.delete(User).where(eq(User.id, target.userId));
  }
}
