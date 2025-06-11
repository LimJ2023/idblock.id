#!/usr/bin/env tsx

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { UserService } from '../src/user/user.service';
import { FaceCompareTestUtil, FaceCompareTestConfig } from '../src/user/face-compare-test.util';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  console.log('🚀 얼굴 비교 정확성 테스트 스크립트 시작...\n');

  // NestJS 애플리케이션 부트스트랩
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  // 명령행 인수 파싱
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ 사용법: npm run test:face-compare <여권이미지경로> <테스트이미지디렉토리> [출력파일경로]');
    console.error('\n예시:');
    console.error('  npm run test:face-compare ./test-images/passport.jpg ./test-images/faces/ ./results.json');
    console.error('\n테스트 이미지 파일명 규칙:');
    console.error('  - match_*.jpg: 여권과 일치하는 이미지');
    console.error('  - nomatch_*.jpg: 여권과 일치하지 않는 이미지');
    process.exit(1);
  }

  const passportImagePath = args[0];
  const testImagesDirectory = args[1];
  const outputPath = args[2];

  // 파일 및 디렉토리 존재 확인
  if (!fs.existsSync(passportImagePath)) {
    console.error(`❌ 여권 이미지 파일이 존재하지 않습니다: ${passportImagePath}`);
    process.exit(1);
  }

  if (!fs.existsSync(testImagesDirectory)) {
    console.error(`❌ 테스트 이미지 디렉토리가 존재하지 않습니다: ${testImagesDirectory}`);
    process.exit(1);
  }

  // 테스트 설정
  const config: FaceCompareTestConfig = {
    passportImagePath,
    testImagesDirectory,
    similarityThreshold: 0.7, // 기본 70% 임계값
    outputPath,
  };

  try {
    // 기본 테스트 실행
    const testUtil = new FaceCompareTestUtil(userService);
    console.log('📊 기본 정확성 테스트 (임계값: 70%) 실행 중...\n');
    
    const summary = await testUtil.runFaceCompareTest(config);

    // 추가 분석: 다양한 임계값으로 성능 비교
    console.log('\n🔧 추가 분석: 다양한 임계값으로 성능 비교...');
    const thresholdResults = await testUtil.analyzeThresholdPerformance(config);

    // 최적 임계값 추천
    console.log('\n🎯 임계값 추천:');
    let bestThreshold = 0.7;
    let bestF1Score = 0;

    thresholdResults.forEach((summary, threshold) => {
      if (summary.f1Score > bestF1Score) {
        bestF1Score = summary.f1Score;
        bestThreshold = threshold;
      }
    });

    console.log(`추천 임계값: ${bestThreshold} (F1 Score: ${bestF1Score.toFixed(3)})`);

    // 종합 결과 출력
    console.log('\n' + '='.repeat(60));
    console.log('🏁 테스트 완료!');
    console.log('='.repeat(60));
    console.log(`✅ 총 ${summary.totalTests}장의 이미지로 테스트 완료`);
    console.log(`📈 기본 설정(임계값 0.7) 정확도: ${summary.accuracy.toFixed(2)}%`);
    console.log(`🎯 추천 임계값: ${bestThreshold} (F1 Score: ${bestF1Score.toFixed(3)})`);
    
    if (outputPath) {
      console.log(`💾 상세 결과 저장: ${outputPath}`);
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 스크립트 실행 중 치명적 오류:', error);
  process.exit(1);
});