import * as fs from 'fs';
import * as path from 'path';
import { UserService } from './user.service';

export interface FaceCompareTestConfig {
  passportImagePath: string;
  testImagesDirectory: string;
  similarityThreshold: number;
  outputPath?: string;
}

export interface TestImageInfo {
  name: string;
  path: string;
  expectedMatch: boolean;
}

export interface FaceCompareTestResult {
  imageName: string;
  similarity: number;
  confidence: number;
  isMatch: boolean;
  expectedMatch: boolean;
  correct: boolean;
  processingTime: number;
}

export interface TestSummary {
  totalTests: number;
  correctPredictions: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  averageProcessingTime: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

/**
 * argosFaceCompare 함수의 정확성을 실제 이미지로 테스트하는 유틸리티 클래스
 */
export class FaceCompareTestUtil {
  constructor(private readonly userService: UserService) {}

  /**
   * 이미지 파일을 base64로 변환
   */
  private async imageToBase64(imagePath: string): Promise<string> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      throw new Error(`이미지 파일을 읽을 수 없습니다: ${imagePath}`);
    }
  }

  /**
   * 테스트 이미지 디렉토리에서 이미지 정보 수집
   * 
   * 파일명 규칙:
   * - match_*.jpg: 여권과 일치하는 이미지
   * - nomatch_*.jpg: 여권과 일치하지 않는 이미지
   */
  private getTestImages(testImagesDirectory: string): TestImageInfo[] {
    const testImages: TestImageInfo[] = [];
    
    if (!fs.existsSync(testImagesDirectory)) {
      throw new Error(`테스트 이미지 디렉토리가 존재하지 않습니다: ${testImagesDirectory}`);
    }

    const files = fs.readdirSync(testImagesDirectory);
    
    files.forEach(file => {
      const filePath = path.join(testImagesDirectory, file);
      const ext = path.extname(file).toLowerCase();
      
      // 이미지 파일만 처리
      if (['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) {
        const fileName = path.basename(file, ext);
        const expectedMatch = fileName.toLowerCase().startsWith('match');
        
        testImages.push({
          name: fileName,
          path: filePath,
          expectedMatch,
        });
      }
    });

    return testImages;
  }

  /**
   * argosFaceCompare를 private 메서드에 접근하여 호출
   */
  private async callArgosFaceCompare(
    documentId: bigint,
    originFace: string,
    targetFace: string,
  ) {
    // UserService의 private 메서드에 접근
    return (this.userService as any).argosFaceCompare(documentId, originFace, targetFace);
  }

  /**
   * 얼굴 비교 테스트 실행
   */
  async runFaceCompareTest(config: FaceCompareTestConfig): Promise<TestSummary> {
    const { 
      passportImagePath, 
      testImagesDirectory, 
      similarityThreshold,
      outputPath 
    } = config;

    console.log('🚀 얼굴 비교 정확성 테스트 시작...');
    console.log(`여권 이미지: ${passportImagePath}`);
    console.log(`테스트 이미지 디렉토리: ${testImagesDirectory}`);
    console.log(`유사도 임계값: ${similarityThreshold}`);

    // 여권 이미지 로드
    const passportImageBase64 = await this.imageToBase64(passportImagePath);
    
    // 테스트 이미지 정보 수집
    const testImages = this.getTestImages(testImagesDirectory);
    console.log(`📊 총 ${testImages.length}장의 테스트 이미지를 발견했습니다.`);
    
    const matchImages = testImages.filter(img => img.expectedMatch).length;
    const nomatchImages = testImages.filter(img => !img.expectedMatch).length;
    console.log(`  - 일치 예상 이미지: ${matchImages}장`);
    console.log(`  - 불일치 예상 이미지: ${nomatchImages}장`);

    // 테스트 실행
    const results: FaceCompareTestResult[] = [];
    const documentId = BigInt(Date.now()); // 테스트용 문서 ID

    for (let i = 0; i < testImages.length; i++) {
      const testImage = testImages[i];
      
      try {
        console.log(`📷 [${i + 1}/${testImages.length}] ${testImage.name} 처리 중...`);
        
        const testImageBase64 = await this.imageToBase64(testImage.path);
        const startTime = Date.now();
        
        const response = await this.callArgosFaceCompare(
          documentId,
          passportImageBase64,
          testImageBase64,
        );
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        const similarity = response.result.faceMatch.similarity;
        const confidence = response.result.faceMatch.confidence;
        const isMatch = similarity >= similarityThreshold;

        results.push({
          imageName: testImage.name,
          similarity,
          confidence,
          isMatch,
          expectedMatch: testImage.expectedMatch,
          correct: isMatch === testImage.expectedMatch,
          processingTime,
        });

        const status = isMatch === testImage.expectedMatch ? '✅' : '❌';
        console.log(
          `  ${status} 유사도: ${(similarity * 100).toFixed(1)}%, ` +
          `신뢰도: ${(confidence * 100).toFixed(1)}%, ` +
          `처리시간: ${processingTime}ms`
        );

      } catch (error) {
        console.error(`❌ ${testImage.name} 처리 중 오류:`, error);
        
        // 실패한 경우도 결과에 포함 (정확도 계산을 위해)
        results.push({
          imageName: testImage.name,
          similarity: 0,
          confidence: 0,
          isMatch: false,
          expectedMatch: testImage.expectedMatch,
          correct: false,
          processingTime: 0,
        });
      }
    }

    // 결과 분석
    const summary = this.analyzeFaceCompareResults(results, similarityThreshold);
    
    // 결과 출력
    this.printTestSummary(summary);
    
    // 상세 결과를 파일로 저장 (선택사항)
    if (outputPath) {
      await this.saveTestResults(results, summary, outputPath);
    }

    return summary;
  }

  /**
   * 테스트 결과 분석
   */
  private analyzeFaceCompareResults(
    results: FaceCompareTestResult[], 
    threshold: number
  ): TestSummary {
    const totalTests = results.length;
    const correctPredictions = results.filter(r => r.correct).length;
    const accuracy = (correctPredictions / totalTests) * 100;

    // Confusion Matrix 계산
    const truePositives = results.filter(r => r.isMatch && r.expectedMatch).length;
    const falsePositives = results.filter(r => r.isMatch && !r.expectedMatch).length;
    const trueNegatives = results.filter(r => !r.isMatch && !r.expectedMatch).length;
    const falseNegatives = results.filter(r => !r.isMatch && r.expectedMatch).length;

    // 정밀도, 재현율, F1 Score 계산
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    // 평균 처리 시간 계산
    const validResults = results.filter(r => r.processingTime > 0);
    const averageProcessingTime = validResults.length > 0 
      ? validResults.reduce((sum, r) => sum + r.processingTime, 0) / validResults.length 
      : 0;

    return {
      totalTests,
      correctPredictions,
      accuracy,
      precision,
      recall,
      f1Score,
      averageProcessingTime,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
    };
  }

  /**
   * 테스트 결과 요약 출력
   */
  private printTestSummary(summary: TestSummary): void {
    console.log('\n' + '='.repeat(50));
    console.log('📊 얼굴 비교 정확성 테스트 결과 요약');
    console.log('='.repeat(50));
    
    console.log(`총 테스트 이미지: ${summary.totalTests}장`);
    console.log(`정확한 예측: ${summary.correctPredictions}장`);
    console.log(`전체 정확도: ${summary.accuracy.toFixed(2)}%`);
    
    console.log('\n📈 상세 성능 지표:');
    console.log(`정밀도 (Precision): ${(summary.precision * 100).toFixed(2)}%`);
    console.log(`재현율 (Recall): ${(summary.recall * 100).toFixed(2)}%`);
    console.log(`F1 Score: ${summary.f1Score.toFixed(3)}`);
    console.log(`평균 처리 시간: ${summary.averageProcessingTime.toFixed(2)}ms`);
    
    console.log('\n🔍 Confusion Matrix:');
    console.log(`True Positives (정확한 일치): ${summary.truePositives}`);
    console.log(`False Positives (잘못된 일치): ${summary.falsePositives}`);
    console.log(`True Negatives (정확한 불일치): ${summary.trueNegatives}`);
    console.log(`False Negatives (놓친 일치): ${summary.falseNegatives}`);
    
    // 성능 평가
    console.log('\n🎯 성능 평가:');
    if (summary.accuracy >= 95) {
      console.log('🌟 우수: 매우 높은 정확도');
    } else if (summary.accuracy >= 90) {
      console.log('👍 양호: 높은 정확도');
    } else if (summary.accuracy >= 80) {
      console.log('⚠️  보통: 개선 필요');
    } else {
      console.log('❌ 미흡: 심각한 개선 필요');
    }
  }

  /**
   * 테스트 결과를 파일로 저장
   */
  private async saveTestResults(
    results: FaceCompareTestResult[],
    summary: TestSummary,
    outputPath: string,
  ): Promise<void> {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      results,
    };

    try {
      const reportJson = JSON.stringify(reportData, null, 2);
      fs.writeFileSync(outputPath, reportJson);
      console.log(`\n💾 상세 결과가 저장되었습니다: ${outputPath}`);
    } catch (error) {
      console.error('❌ 결과 저장 중 오류:', error);
    }
  }

  /**
   * 다양한 임계값으로 성능 분석
   */
  async analyzeThresholdPerformance(
    config: FaceCompareTestConfig,
    thresholds: number[] = [0.5, 0.6, 0.7, 0.8, 0.9]
  ): Promise<Map<number, TestSummary>> {
    console.log('\n🔧 임계값별 성능 분석 시작...');
    
    const results = new Map<number, TestSummary>();
    
    for (const threshold of thresholds) {
      console.log(`\n📊 임계값 ${threshold} 테스트 중...`);
      const testConfig = { ...config, similarityThreshold: threshold };
      const summary = await this.runFaceCompareTest(testConfig);
      results.set(threshold, summary);
    }

    // 임계값별 결과 비교 출력
    console.log('\n' + '='.repeat(60));
    console.log('📈 임계값별 성능 비교');
    console.log('='.repeat(60));
    console.log('임계값\t정확도\t정밀도\t재현율\tF1 Score');
    console.log('-'.repeat(50));
    
    thresholds.forEach(threshold => {
      const summary = results.get(threshold)!;
      console.log(
        `${threshold.toFixed(1)}\t` +
        `${summary.accuracy.toFixed(1)}%\t` +
        `${(summary.precision * 100).toFixed(1)}%\t` +
        `${(summary.recall * 100).toFixed(1)}%\t` +
        `${summary.f1Score.toFixed(3)}`
      );
    });

    return results;
  }
}

// 사용 예시를 위한 함수
export async function runFaceCompareAccuracyTest(
  userService: UserService,
  passportImagePath: string,
  testImagesDirectory: string,
  outputPath?: string,
): Promise<TestSummary> {
  const testUtil = new FaceCompareTestUtil(userService);
  
  const config: FaceCompareTestConfig = {
    passportImagePath,
    testImagesDirectory,
    similarityThreshold: 0.7, // 70% 임계값
    outputPath,
  };

  return await testUtil.runFaceCompareTest(config);
} 