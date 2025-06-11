#!/usr/bin/env tsx

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

interface FaceCompareResponse {
  apiType: string;
  transactionId: string;
  result: {
    face: {
      isAvailable: boolean;
      boundingBox: any;
    };
    faceMatch: {
      isAvailable: boolean;
      boundingBox: any;
      similarity: number;
      confidence: number;
      landmarks: any[];
      pose: any;
      quality: any;
    };
  };
}

interface TestResult {
  imageName: string;
  similarity: number;
  confidence: number;
  isMatch: boolean;
  expectedMatch: boolean;
  correct: boolean;
  processingTime: number;
}

// 이미지를 base64로 변환하는 함수
function imageToBase64(imagePath: string): string {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    throw new Error(`이미지 파일을 읽을 수 없습니다: ${imagePath}`);
  }
}

// Argos API를 직접 호출하는 함수
async function callArgosFaceCompare(
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
          'x-api-key': process.env.ARGOS_API_KEY,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Argos API 호출 오류:', error);
    throw new Error('얼굴 비교 API 호출에 실패했습니다');
  }
}

// 테스트 이미지 정보 수집
function getTestImages(testImagesDirectory: string) {
  if (!fs.existsSync(testImagesDirectory)) {
    throw new Error(`테스트 이미지 디렉토리가 존재하지 않습니다: ${testImagesDirectory}`);
  }

  const files = fs.readdirSync(testImagesDirectory);
  const testImages: { name: string; path: string; expectedMatch: boolean }[] = [];

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

// 메인 테스트 함수
async function runSimpleFaceTest() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ 사용법: npm run simple-face-test <여권이미지경로> <테스트이미지디렉토리> [출력파일경로]');
    console.error('\n예시:');
    console.error('  npm run simple-face-test ./test-images/passport.jpg ./test-images/faces/ ./results.json');
    process.exit(1);
  }

  const passportImagePath = args[0];
  const testImagesDirectory = args[1];
  const outputPath = args[2];
  const similarityThreshold = 0.7;

  // API 키 확인
  if (!process.env.ARGOS_API_KEY) {
    console.error('❌ ARGOS_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.error('   .env 파일에 ARGOS_API_KEY를 설정해주세요.');
    process.exit(1);
  }

  // 파일 존재 확인
  if (!fs.existsSync(passportImagePath)) {
    console.error(`❌ 여권 이미지 파일이 존재하지 않습니다: ${passportImagePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(testImagesDirectory)) {
    console.error(`❌ 테스트 이미지 디렉토리가 존재하지 않습니다: ${testImagesDirectory}`);
    process.exit(1);
  }

  console.log('🚀 간편 얼굴 비교 정확성 테스트 시작...');
  console.log(`📄 여권 이미지: ${passportImagePath}`);
  console.log(`📁 테스트 이미지 디렉토리: ${testImagesDirectory}`);
  console.log(`🎯 유사도 임계값: ${similarityThreshold}`);

  // 여권 이미지 로드
  const passportImageBase64 = imageToBase64(passportImagePath);
  
  // 테스트 이미지 정보 수집
  const testImages = getTestImages(testImagesDirectory);
  console.log(`📊 총 ${testImages.length}장의 테스트 이미지를 발견했습니다.`);
  
  const matchImages = testImages.filter(img => img.expectedMatch).length;
  const nomatchImages = testImages.filter(img => !img.expectedMatch).length;
  console.log(`  - 일치 예상 이미지: ${matchImages}장`);
  console.log(`  - 불일치 예상 이미지: ${nomatchImages}장\n`);

  // 테스트 실행
  const results: TestResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < testImages.length; i++) {
    const testImage = testImages[i];
    
    try {
      console.log(`📷 [${i + 1}/${testImages.length}] ${testImage.name} 처리 중...`);
      
      const testImageBase64 = imageToBase64(testImage.path);
      const startTime = Date.now();
      
      const response = await callArgosFaceCompare(
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

      successCount++;
      
      // API 제한을 고려하여 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`❌ ${testImage.name} 처리 중 오류:`, error);
      errorCount++;
      
      // 오류가 발생해도 결과에 포함
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

  // 결과 출력
  console.log('\n' + '='.repeat(50));
  console.log('📊 얼굴 비교 정확성 테스트 결과 요약');
  console.log('='.repeat(50));
  
  console.log(`총 테스트 이미지: ${totalTests}장`);
  console.log(`성공적으로 처리된 이미지: ${successCount}장`);
  console.log(`오류 발생 이미지: ${errorCount}장`);
  console.log(`정확한 예측: ${correctPredictions}장`);
  console.log(`전체 정확도: ${accuracy.toFixed(2)}%`);
  
  console.log('\n📈 상세 성능 지표:');
  console.log(`정밀도 (Precision): ${(precision * 100).toFixed(2)}%`);
  console.log(`재현율 (Recall): ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score: ${f1Score.toFixed(3)}`);
  console.log(`평균 처리 시간: ${averageProcessingTime.toFixed(2)}ms`);
  
  console.log('\n🔍 Confusion Matrix:');
  console.log(`True Positives (정확한 일치): ${truePositives}`);
  console.log(`False Positives (잘못된 일치): ${falsePositives}`);
  console.log(`True Negatives (정확한 불일치): ${trueNegatives}`);
  console.log(`False Negatives (놓친 일치): ${falseNegatives}`);
  
  // 성능 평가
  console.log('\n🎯 성능 평가:');
  if (accuracy >= 95) {
    console.log('🌟 우수: 매우 높은 정확도');
  } else if (accuracy >= 90) {
    console.log('👍 양호: 높은 정확도');
  } else if (accuracy >= 80) {
    console.log('⚠️  보통: 개선 필요');
  } else {
    console.log('❌ 미흡: 심각한 개선 필요');
  }

  // 결과를 파일로 저장
  if (outputPath) {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
          totalTests,
          successCount,
          errorCount,
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
        },
        results,
      };

      const reportJson = JSON.stringify(reportData, null, 2);
      fs.writeFileSync(outputPath, reportJson);
      console.log(`\n💾 상세 결과가 저장되었습니다: ${outputPath}`);
    } catch (error) {
      console.error('❌ 결과 저장 중 오류:', error);
    }
  }

  console.log('\n🏁 테스트 완료!');
}

// 스크립트 실행
runSimpleFaceTest().catch(error => {
  console.error('❌ 스크립트 실행 중 오류:', error);
  process.exit(1);
}); 