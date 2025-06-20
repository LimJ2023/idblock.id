import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { EnvService } from 'src/env/env.service';
import { S3Service } from 'src/s3/s3.service';
import {
  FaceCompareResponse,
  FaceLivenessResponse,
  IdLivenessResponse,
  RecognitionResponse,
} from './argos.types';
import {
  City,
  Country,
    UserVerificationDocument,
  } from 'src/database/schema';
import { DrizzleDB, INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { eq, desc } from 'drizzle-orm';

@Injectable()
export class ArgosService {
  constructor(
    @Inject(INJECT_DRIZZLE) private readonly db: DrizzleDB,
    private readonly envService: EnvService,
    private readonly s3Service: S3Service,
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

  async recognition(idImage: string): Promise<RecognitionResponse> {
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

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Recognition:', error);
      throw new BadRequestException('Failed to fetch Argos Recognition');
    }
  }

  async recognitionFromFile(file: Express.Multer.File): Promise<any> {
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

  async faceCompare(originFaceKey: string, targetFaceKey: string): Promise<{similarity: number, confidence: number}> {
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

      console.log(`face similarity: ${similarity}, confidence: ${confidence}`);
      return {similarity, confidence};
    } catch (error) {
      console.error('Error fetching Argos Face Compare:', error);
      throw new BadRequestException('Failed to fetch Argos Face Compare');
    }
  }

  async faceCompareWithDetails(
    originFace: string,
    targetFace: string,
  ): Promise<FaceCompareResponse> {
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

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Face Compare:', error);
      throw new BadRequestException('Failed to fetch Argos Face Compare');
    }
  }

  async idLiveness(idImage: string): Promise<IdLivenessResponse> {
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

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos ID Liveness:', error);
      throw new BadRequestException('Failed to fetch Argos ID Liveness');
    }
  }

  async faceLiveness(faceImage: string): Promise<FaceLivenessResponse> {
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

      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Face Liveness:', error);
      throw new BadRequestException('Failed to fetch Argos Face Liveness');
    }
  }

  async prepareImageFromUrl(url: string): Promise<string> {
    return this.fetchImageAsBase64(url);
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
      const idImageBase64 = await this.prepareImageFromUrl(idImageUrl);
      const faceImageBase64 = await this.prepareImageFromUrl(faceImageUrl);
  
      let data: any;
      let faceData: any;
      let compareData: any;

      try {
        data = await this.idLiveness(idImageBase64);
        console.log('id >>>>>>.', data);
      } catch (error) {}
  
      try {
        faceData = await this.faceLiveness(
          faceImageBase64,
        );
        console.log('face >>>>>>.', faceData);
      } catch (error) {}
  
      try {
        compareData = await this.faceCompare(
          target.passportImageKey,
          target.profileImageKey,
        );
        console.log('compare >>>>>>.', compareData);
      } catch (error) {}

      //유저의 document에 데이터 저장

      try {
      await this.db.update(UserVerificationDocument).set({
        screenReplay: data?.result?.screenReplay?.liveness_score,
        paperPrinted: data?.result?.paperPrinted?.liveness_score,
        replacePortraits: data?.result?.replacePortraits?.liveness_score,
        faceLiveness: faceData?.result?.liveness_score,
        matchSimilarity: compareData?.similarity,
        matchConfidence: compareData?.confidence,
      }).where(eq(UserVerificationDocument.id, documentId));
      } catch (error) {
        console.error('Error updating UserVerificationDocument:', error);
        throw new BadRequestException('Failed to update UserVerificationDocument');
      }

      //target 데이터 업데이트
      target.screenReplay = data?.result?.screenReplay?.liveness_score;
      target.paperPrinted = data?.result?.paperPrinted?.liveness_score;
      target.replacePortraits = data?.result?.replacePortraits?.liveness_score;
      target.faceLiveness = faceData?.result?.liveness_score;
      target.matchSimilarity = compareData?.similarity;
      target.matchConfidence = compareData?.confidence;

      return target;
  }
} 