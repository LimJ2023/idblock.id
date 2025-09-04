import { BadRequestException, Body, Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { EnvService } from 'src/env/env.service';
import { S3Service } from 'src/s3/s3.service';
import {
  FaceCompareResponse,
  FaceLivenessResponse,
  IdLivenessResponse,
  RecognitionResponse,
  AddNewFaceResponse,
  GetFaceDataResponse,
  SearchFaceResponse,
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

  // id용 얼굴 데이터 추가
  async argosAddNewFace(faceImage: Express.Multer.File, collectionId: string, userName: string) {
    const fileUrl = await this.s3Service.uploadFile(faceImage, 'public/passport/');
    const faceImageBase64 = await this.fetchImageAsBase64(fileUrl.url);

    try {
    const response = await axios.post<AddNewFaceResponse>(
      'https://face.argosidentity.com/faces',
      {
        "collectionId": collectionId,
        "userName": userName,
        "faceImage": faceImageBase64
      },
      {
        headers: {
          'x-api-key': this.envService.get('ARGOS_API_KEY'),
        },
      },
    );
    return response.data;
  }catch (e: any) {
      console.error(e);
      throw new BadRequestException('Failed to fetch Argos Add New Face');
    }
  }

  // 얼굴 데이터 조회
  async argosGetFaceData(collectionId: string) {
    try{
    
      const response = await axios.get<GetFaceDataResponse>(`https://face.argosidentity.com/faces`,{
        headers: {
          'x-api-key': this.envService.get('ARGOS_API_KEY'),
        },
        params: {
          collectionId: collectionId,
          page: '1',
        }
      });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching Argos Get Face Data:', error);
      throw new BadRequestException('Failed to fetch Argos Get Face Data');
    }
  }

  // 얼굴 검색
  async argosSearchFace(collectionId: string, userName: string, faceImage: Express.Multer.File) {
    const fileUrl = await this.s3Service.uploadFile(faceImage, 'public/passport/');
    const faceImageBase64 = await this.fetchImageAsBase64(fileUrl.url);

    try {
      const response = await axios.post<SearchFaceResponse>(
        'https://face.argosidentity.com/search',
        {
          "collectionId": collectionId,
          "requestName": userName,
          "faceImage": faceImageBase64
        },
        {
          headers: {
            'x-api-key': this.envService.get('ARGOS_API_KEY'),
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching Argos Search Face:', error);
      throw new BadRequestException('Failed to fetch Argos Search Face');
    }
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
        'response >>>>>>.',
        JSON.stringify(response.data),
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
  
      let data: any = null;
      let faceData: any = null;
      let compareData: any = null;
      let errors: string[] = [];

      // ID 라이브니스 검사
      try {
        console.log('ID 라이브니스 검사 시작...');
        data = await this.idLiveness(idImageBase64);
        console.log('ID 라이브니스 검사 성공:', data);
      } catch (error) {
        console.error('ID 라이브니스 검사 실패:', error);
        errors.push('ID 라이브니스 검사 실패');
      }
  
      // 얼굴 라이브니스 검사
      try {
        console.log('얼굴 라이브니스 검사 시작...');
        faceData = await this.faceLiveness(faceImageBase64);
        console.log('얼굴 라이브니스 검사 성공:', faceData);
      } catch (error) {
        console.error('얼굴 라이브니스 검사 실패:', error);
        errors.push('얼굴 라이브니스 검사 실패');
      }
  
      // 얼굴 비교 검사
      try {
        console.log('얼굴 비교 검사 시작...');
        compareData = await this.faceCompare(
          target.passportImageKey,
          target.profileImageKey,
        );
        console.log('얼굴 비교 검사 성공:', compareData);
      } catch (error) {
        console.error('얼굴 비교 검사 실패:', error);
        errors.push('얼굴 비교 검사 실패');
      }

      // 오류 요약 로그
      if (errors.length > 0) {
        console.error(`총 ${errors.length}개의 Argos API 호출 실패:`, errors);
      }

      //유저의 document에 데이터 저장
      try {
        await this.db.update(UserVerificationDocument).set({
          screenReplay: data?.result?.screenReplay?.liveness_score || null,
          paperPrinted: data?.result?.paperPrinted?.liveness_score || null,
          replacePortraits: data?.result?.replacePortraits?.liveness_score || null,
          faceLiveness: faceData?.result?.liveness_score || null,
          matchSimilarity: compareData?.similarity || null,
          matchConfidence: compareData?.confidence || null,
        }).where(eq(UserVerificationDocument.id, documentId));
        
        console.log('UserVerificationDocument 업데이트 완료');
      } catch (error) {
        console.error('Error updating UserVerificationDocument:', error);
        throw new BadRequestException('Failed to update UserVerificationDocument');
      }

      //target 데이터 업데이트
      target.screenReplay = data?.result?.screenReplay?.liveness_score || null;
      target.paperPrinted = data?.result?.paperPrinted?.liveness_score || null;
      target.replacePortraits = data?.result?.replacePortraits?.liveness_score || null;
      target.faceLiveness = faceData?.result?.liveness_score || null;
      target.matchSimilarity = compareData?.similarity || null;
      target.matchConfidence = compareData?.confidence || null;

      return target;
  }
} 