#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';

async function renameTestImages() {
  const facesDir = path.join(process.cwd(), 'test-images', 'faces');
  
  console.log('🔄 테스트 이미지 파일명 변경 시작...');
  console.log(`📁 대상 디렉토리: ${facesDir}`);
  
  if (!fs.existsSync(facesDir)) {
    console.error(`❌ 디렉토리가 존재하지 않습니다: ${facesDir}`);
    process.exit(1);
  }

  // 디렉토리의 모든 파일 읽기
  const files = fs.readdirSync(facesDir);
  
  // img*.jpg 패턴에 맞는 파일들 필터링
  const imgFiles = files.filter(file => {
    return file.match(/^img\d+\.jpg$/i);
  });

  console.log(`📊 변경할 파일 개수: ${imgFiles.length}개`);
  
  if (imgFiles.length === 0) {
    console.log('ℹ️  변경할 img*.jpg 파일이 없습니다.');
    return;
  }

  // 파일명 변경 작업
  let successCount = 0;
  let errorCount = 0;

  for (const file of imgFiles) {
    try {
      const oldPath = path.join(facesDir, file);
      
      // img1.jpg -> nomatch_1.jpg 형태로 변경
      const numberMatch = file.match(/img(\d+)\.jpg/i);
      if (numberMatch) {
        const number = numberMatch[1];
        const newFileName = `nomatch_${number}.jpg`;
        const newPath = path.join(facesDir, newFileName);
        
        // 새 파일명이 이미 존재하는지 확인
        if (fs.existsSync(newPath)) {
          console.log(`⚠️  건너뜀: ${newFileName} 파일이 이미 존재합니다.`);
          continue;
        }
        
        // 파일명 변경
        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${file} → ${newFileName}`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ ${file} 변경 실패:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 파일명 변경 결과 요약');
  console.log('='.repeat(50));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  console.log(`📊 총 처리: ${successCount + errorCount}개`);
  
  if (successCount > 0) {
    console.log('\n🎉 파일명 변경이 완료되었습니다!');
    console.log('ℹ️  이제 얼굴 비교 테스트에서 이 이미지들이 "불일치" 이미지로 분류됩니다.');
  }
}

// 확인 프롬프트 (선택사항)
function showConfirmation() {
  console.log('⚠️  주의: 이 작업은 test-images/faces/ 폴더의 img*.jpg 파일들을');
  console.log('   nomatch_*.jpg 형태로 이름을 변경합니다.');
  console.log('');
  console.log('변경 예시:');
  console.log('  img1.jpg → nomatch_1.jpg');
  console.log('  img2.jpg → nomatch_2.jpg');
  console.log('  img67.jpg → nomatch_67.jpg');
  console.log('');
  
  // Node.js 환경에서 사용자 입력 받기
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<boolean>((resolve) => {
    rl.question('계속 진행하시겠습니까? (y/N): ', (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  console.log('🚀 테스트 이미지 파일명 변경 도구\n');
  
  // 명령행 인수 확인 (--yes 플래그로 확인 건너뛰기)
  const args = process.argv.slice(2);
  const skipConfirmation = args.includes('--yes') || args.includes('-y');
  
  if (!skipConfirmation) {
    const confirmed = await showConfirmation();
    if (!confirmed) {
      console.log('❌ 작업이 취소되었습니다.');
      process.exit(0);
    }
  }
  
  await renameTestImages();
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 스크립트 실행 중 오류:', error);
  process.exit(1);
}); 