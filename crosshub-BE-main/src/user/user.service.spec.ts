import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import { INJECT_DRIZZLE } from 'src/database/drizzle.provider';
import { S3Service } from 'src/s3/s3.service';
import { ThirdwebService } from 'src/thirdweb/thirdweb.service';
import { NotificationService } from 'src/notification/notification.service';
import { EnvService } from 'src/env/env.service';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserService - argosFaceCompare 정확성 테스트', () => {
  let service: UserService;
  let envService: EnvService;

  // 테스트용 이미지 데이터 타입
  interface TestImage {
    name: string;
    base64: string;
    isMatch: boolean; // 여권 이미지와 일치하는지 여부
  }

  // 테스트 결과 타입
  interface TestResult {
    imageName: string;
    similarity: number;
    confidence: number;
    isMatch: boolean;
    expectedMatch: boolean;
    correct: boolean;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: INJECT_DRIZZLE,
          useValue: {
            update: jest.fn().mockReturnValue({
              set: jest.fn().mockReturnValue({
                where: jest.fn(),
              }),
            }),
          },
        },
        {
          provide: S3Service,
          useValue: {},
        },
        {
          provide: ThirdwebService,
          useValue: {},
        },
        {
          provide: NotificationService,
          useValue: {},
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    envService = module.get<EnvService>(EnvService);
  });

  // argosFaceCompare 메서드를 public으로 만들기 위한 헬퍼 메서드
  const callArgosFaceCompare = async (
    documentId: bigint,
    originFace: string,
    targetFace: string,
  ) => {
    // private 메서드에 접근하기 위해 any로 캐스팅
    return (service as any).argosFaceCompare(documentId, originFace, targetFace);
  };

  describe('얼굴 비교 정확성 테스트', () => {
    // 테스트용 base64 이미지 생성 함수
    const generateTestImage = (name: string): string => {
      // 실제 테스트에서는 진짜 이미지의 base64를 사용해야 합니다
      // 여기서는 예시용 가짜 base64 데이터를 생성합니다
      return Buffer.from(`test-image-${name}`).toString('base64');
    };

    // 테스트용 이미지 데이터 준비
    const prepareTestImages = (): TestImage[] => {
      const testImages: TestImage[] = [];
      
      // 일치하는 이미지 10장 (같은 사람)
      for (let i = 1; i <= 10; i++) {
        testImages.push({
          name: `match_image_${i}`,
          base64: generateTestImage(`match_${i}`),
          isMatch: true,
        });
      }

      // 일치하지 않는 이미지 40장 (다른 사람들)
      for (let i = 1; i <= 40; i++) {
        testImages.push({
          name: `no_match_image_${i}`,
          base64: generateTestImage(`no_match_${i}`),
          isMatch: false,
        });
      }

      return testImages;
    };

    it('50장의 이미지로 얼굴 비교 정확성 테스트', async () => {
      // 테스트용 여권 이미지
      const passportImage = generateTestImage('passport');
      const testImages = prepareTestImages();
      const documentId = BigInt(1);

      // Mock API 응답 설정
      mockedAxios.post.mockImplementation((url, data: any) => {
        if (url.includes('modules/compare')) {
          const { targetFace } = data;
          const targetImageName = Buffer.from(targetFace, 'base64').toString();
          
          // 이미지 이름에 따라 다른 similarity와 confidence 반환
          const isMatchImage = targetImageName.includes('match_');
          const similarity = isMatchImage 
            ? 0.85 + Math.random() * 0.1  // 85-95% 유사도
            : 0.30 + Math.random() * 0.3; // 30-60% 유사도
          
          const confidence = isMatchImage 
            ? 0.90 + Math.random() * 0.08 // 90-98% 신뢰도
            : 0.40 + Math.random() * 0.4; // 40-80% 신뢰도

          return Promise.resolve({
            data: {
              apiType: 'compare',
              transactionId: 'test-transaction',
              result: {
                face: {
                  isAvailable: true,
                  boundingBox: { Width: 0.5, Height: 0.5, Left: 0.25, Top: 0.25 },
                },
                faceMatch: {
                  isAvailable: true,
                  boundingBox: { Width: 0.5, Height: 0.5, Left: 0.25, Top: 0.25 },
                  similarity,
                  confidence,
                  landmarks: [],
                  pose: { Roll: 0, Yaw: 0, Pitch: 0 },
                  quality: { Brightness: 0.8, Sharpness: 0.9 },
                },
              },
            },
          });
        }
        return Promise.reject(new Error('Unknown API endpoint'));
      });

      // 모든 이미지에 대해 얼굴 비교 실행
      const results: TestResult[] = [];
      const similarityThreshold = 0.7; // 70% 이상이면 일치로 판단
      
      for (const testImage of testImages) {
        try {
          const response = await callArgosFaceCompare(
            documentId,
            passportImage,
            testImage.base64,
          );

          const similarity = response.result.faceMatch.similarity;
          const confidence = response.result.faceMatch.confidence;
          const isMatch = similarity >= similarityThreshold;

          results.push({
            imageName: testImage.name,
            similarity,
            confidence,
            isMatch,
            expectedMatch: testImage.isMatch,
            correct: isMatch === testImage.isMatch,
          });
        } catch (error) {
          console.error(`Error testing image ${testImage.name}:`, error);
        }
      }

      // 결과 분석
      const totalTests = results.length;
      const correctPredictions = results.filter(r => r.correct).length;
      const accuracy = (correctPredictions / totalTests) * 100;

      // True Positive, False Positive, True Negative, False Negative 계산
      const truePositives = results.filter(r => r.isMatch && r.expectedMatch).length;
      const falsePositives = results.filter(r => r.isMatch && !r.expectedMatch).length;
      const trueNegatives = results.filter(r => !r.isMatch && !r.expectedMatch).length;
      const falseNegatives = results.filter(r => !r.isMatch && r.expectedMatch).length;

      // 정밀도와 재현율 계산
      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

      // 테스트 결과 출력
      console.log('\n=== 얼굴 비교 정확성 테스트 결과 ===');
      console.log(`총 테스트 이미지: ${totalTests}장`);
      console.log(`정확한 예측: ${correctPredictions}장`);
      console.log(`정확도: ${accuracy.toFixed(2)}%`);
      console.log('\n=== 상세 지표 ===');
      console.log(`True Positives: ${truePositives}`);
      console.log(`False Positives: ${falsePositives}`);
      console.log(`True Negatives: ${trueNegatives}`);
      console.log(`False Negatives: ${falseNegatives}`);
      console.log(`정밀도 (Precision): ${(precision * 100).toFixed(2)}%`);
      console.log(`재현율 (Recall): ${(recall * 100).toFixed(2)}%`);
      console.log(`F1 Score: ${f1Score.toFixed(3)}`);

      // 상세 결과 출력
      console.log('\n=== 상세 결과 ===');
      results.forEach(result => {
        const status = result.correct ? '✅' : '❌';
        console.log(
          `${status} ${result.imageName}: ` +
          `유사도=${(result.similarity * 100).toFixed(1)}%, ` +
          `신뢰도=${(result.confidence * 100).toFixed(1)}%, ` +
          `예측=${result.isMatch ? '일치' : '불일치'}, ` +
          `실제=${result.expectedMatch ? '일치' : '불일치'}`
        );
      });

      // 임계값별 성능 분석
      console.log('\n=== 임계값별 성능 분석 ===');
      const thresholds = [0.5, 0.6, 0.7, 0.8, 0.9];
      thresholds.forEach(threshold => {
        const thresholdResults = results.map(r => ({
          ...r,
          isMatch: r.similarity >= threshold,
        }));
        
        const thresholdCorrect = thresholdResults.filter(r => r.isMatch === r.expectedMatch).length;
        const thresholdAccuracy = (thresholdCorrect / totalTests) * 100;
        
        console.log(`임계값 ${threshold}: 정확도 ${thresholdAccuracy.toFixed(2)}%`);
      });

      // 어설션
      expect(totalTests).toBe(50);
      expect(accuracy).toBeGreaterThan(80); // 80% 이상의 정확도 기대
      expect(precision).toBeGreaterThan(0.7); // 70% 이상의 정밀도 기대
      expect(recall).toBeGreaterThan(0.7); // 70% 이상의 재현율 기대
    });

    it('API 에러 처리 테스트', async () => {
      const generateTestImage = (name: string): string => {
        return Buffer.from(`test-image-${name}`).toString('base64');
      };
      
      const documentId = BigInt(1);
      const passportImage = generateTestImage('passport');
      const testImage = generateTestImage('test');

      // API 에러 mock
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(
        callArgosFaceCompare(documentId, passportImage, testImage)
      ).rejects.toThrow(BadRequestException);
    });

    it('유사도 임계값 테스트', async () => {
      const generateTestImage = (name: string): string => {
        return Buffer.from(`test-image-${name}`).toString('base64');
      };
      
      const documentId = BigInt(1);
      const passportImage = generateTestImage('passport');
      
      // 다양한 유사도 값 테스트
      const testCases = [
        { similarity: 0.95, expected: true },
        { similarity: 0.85, expected: true },
        { similarity: 0.75, expected: true },
        { similarity: 0.65, expected: false },
        { similarity: 0.45, expected: false },
        { similarity: 0.25, expected: false },
      ];

      for (const testCase of testCases) {
        mockedAxios.post.mockResolvedValue({
          data: {
            result: {
              faceMatch: {
                similarity: testCase.similarity,
                confidence: 0.9,
              },
            },
          },
        });

        const response = await callArgosFaceCompare(
          documentId,
          passportImage,
          generateTestImage('test'),
        );

        const isMatch = response.result.faceMatch.similarity >= 0.7;
        expect(isMatch).toBe(testCase.expected);
      }
    });
  });

  describe('성능 및 안정성 테스트', () => {
    it('대량 이미지 처리 성능 테스트', async () => {
      const documentId = BigInt(1);
      const generateTestImage = (name: string): string => {
        return Buffer.from(`test-image-${name}`).toString('base64');
      };
      const passportImage = generateTestImage('passport');
      const imageCount = 100; // 100장으로 성능 테스트

      mockedAxios.post.mockResolvedValue({
        data: {
          result: {
            faceMatch: {
              similarity: 0.8,
              confidence: 0.9,
            },
          },
        },
      });

      const startTime = Date.now();
      const promises = Array.from({ length: imageCount }, (_, i) =>
        callArgosFaceCompare(
          documentId,
          passportImage,
          generateTestImage(`perf_test_${i}`),
        )
      );

      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`${imageCount}장 처리 시간: ${duration}ms`);
      console.log(`평균 처리 시간: ${(duration / imageCount).toFixed(2)}ms/이미지`);

      // 성능 기준: 100장을 10초 내에 처리 (mock이므로 매우 빨라야 함)
      expect(duration).toBeLessThan(10000);
    });
  });
}); 